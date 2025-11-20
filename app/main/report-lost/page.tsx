"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    addDoc,
    collection,
    getFirestore,
    Timestamp,
    query,
    where,
    getDocs,
    limit,
    doc,
    getDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { app } from "@lib/firebaseConfig";
import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

/* -------------------------- Utility: Date & Time -------------------------- */

// Check if two dates fall on the same day
function isSameDay(a?: Date, b?: Date) {
    if (!a || !b) return false;
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

// Merge a date and a time string (HH:mm or HH:mm:ss) into a Date object
function combineDateAndTime(date?: Date, time?: string): Date {
    const base = date ? new Date(date) : new Date();
    const [hh = "00", mm = "00"] = (time || "00:00").split(":");
    base.setHours(Number(hh), Number(mm), 0, 0);
    return base;
}

// Format the current time for <input type="time">, minute precision
function timeNowForInput(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/* -------------------------- Utility: Daily Post Limit -------------------------- */

// Return start of today (00:00)
function startOfTodayDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

// Count how many items a user has posted today
async function getTodayPostCount(db: ReturnType<typeof getFirestore>, uid: string) {
    const todayStart = Timestamp.fromDate(startOfTodayDate());
    const qCount = query(
        collection(db, "items"),
        where("ownerUid", "==", uid),
        where("createdAt", ">=", todayStart),
        limit(10)
    );
    const snap = await getDocs(qCount);
    return snap.size;
}

const db = getFirestore(app);
const storage = getStorage(app);

/* -------------------------- Form Schema -------------------------- */

const formSchema = z
    .object({
        itemName: z.string().min(2, "Item name must be at least 2 characters."),
        category: z.string().min(1, "Please select a category."),
        description: z.string().min(10, "Please provide a detailed description."),
        dateLost: z.date().refine((val) => val instanceof Date && !isNaN(val.getTime()), { message: "Please pick a valid date.", }), timeLost: z.string().optional(),
        location: z.string().min(2, "Please select a location."),
        name: z.string().min(2, "Please enter your full name."),
        email: z.string().email("Invalid email address."),
        phone: z.string().optional(),
        photos: z.any().optional(),
    })
    .superRefine((data, ctx) => {
        // Prevent choosing a future date/time
        const combined = combineDateAndTime(data.dateLost, data.timeLost);
        if (combined.getTime() > Date.now()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["timeLost"],
                message: "Date/Time cannot be in the future.",
            });
        }
    });

/* -------------------------- Page -------------------------- */

export default function ReportLostPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading form...</div>}>
            <ReportLostContent />
        </Suspense>
    );
}

/* -------------------------- Component -------------------------- */

function ReportLostContent() {
    const router = useRouter();
    const params = useSearchParams();
    const returnTo = params.get("returnTo") || "/main/profile";
    const { uid } = useAuth();

    const [loading, setLoading] = useState(false);
    const [openDate, setOpenDate] = useState(false);
    const pickedType = params.get("type");
    const [isFound, setIsFound] = useState(pickedType === "found");

    // store "current time" only on client to avoid hydration mismatch
    const [nowForTimeInput, setNowForTimeInput] = useState<string | undefined>(undefined);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemName: "",
            category: "",
            description: "",
            location: "",
            name: "",
            email: "",
            phone: "",
            dateLost: new Date(),
            timeLost: "", // set after mount
        },
    });

    // Set current time after hydration (client only)
    useEffect(() => {
        const t = timeNowForInput();
        setNowForTimeInput(t);
        if (!form.getValues("timeLost")) {
            form.setValue("timeLost", t, { shouldValidate: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* -------------------------- Submit -------------------------- */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!uid) return alert("Please sign in first.");
        setLoading(true);

        try {
            // (1) Daily post limit
            const postedToday = await getTodayPostCount(db, uid);
            if (postedToday >= 10) {
                toast.error("You've reached the daily limit (10 posts per day).");
                setLoading(false);
                return;
            }

            // (2) Future time validation
            const combinedWhen = combineDateAndTime(values.dateLost, values.timeLost);
            if (combinedWhen.getTime() > Date.now()) {
                toast.error("Date/Time cannot be in the future.");
                setLoading(false);
                return;
            }

            // (3) Photo upload (max 4)
            const fileList = values.photos as FileList | null;
            const photoURLs: string[] = [];
            if (fileList?.length) {
                const filesToUpload = Array.from(fileList).slice(0, 4);
                if (fileList.length > 4) {
                    toast("Only the first 4 photos will be uploaded.", { icon: "ℹ️" });
                }
                const uploadPromises = filesToUpload.map(async (file) => {
                    const storageRef = ref(storage, `items/${uid}/${Date.now()}-${file.name}`);
                    await uploadBytes(storageRef, file);
                    return getDownloadURL(storageRef);
                });
                const urls = await Promise.all(uploadPromises);
                photoURLs.push(...urls);
            }

            // (4) Save to Firestore
            const { photos, dateLost, ...cleanData } = values;
            const timestampDate = Timestamp.fromDate(combinedWhen);

            // let's also get user's coffee link from their profile
            let userCoffeeLink = "";
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                userCoffeeLink = userSnap.data().coffeeLink || "";
            }

            await addDoc(collection(db, "items"), {
                ...cleanData,
                [isFound ? "dateFound" : "dateLost"]: timestampDate,
                ownerUid: uid,
                type: isFound,
                status: isFound ? "found" : "lost",
                photoURLs,
                coffeeLink: userCoffeeLink,
                createdAt: Timestamp.now(),
            });

            toast.success("🎉 Item submitted successfully!", {
                style: { borderRadius: "10px", background: "#f0fdf4", color: "#065f46" },
            });

            router.push(returnTo);
        } catch (e) {
            console.error(e);
            alert("Failed to submit item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------- UI -------------------------- */

    const LOCATIONS: Record<string, { lng: number; lat: number }> = {
        Campus: { lng: -121.8807, lat: 37.3352 },
        Library: { lng: -121.8821, lat: 37.3357 },
        Cafeteria: { lng: -121.881, lat: 37.3349 },
        Gym: { lng: -121.8795, lat: 37.3365 },
    };
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* ---------- Header ---------- */}
            <section className="px-10 py-10 text-center space-y-3">
                <h2 className="text-2xl font-semibold mb-2">
                    Help reunite lost items with their owners or find what you’ve lost
                </h2>

                {/* Toggle Lost/Found */}
                <div className="flex justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={() => setIsFound((prev) => !prev)}
                            variant={isFound ? "found" : "lost"}
                            size="lg"
                            className="text-2xl px-6 py-3 transition-colors duration-500"
                        >
                            <AnimatePresence mode="wait">
                                {isFound ? (
                                    <motion.span
                                        key="found"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        YOU FOUND THIS ITEM 😊
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="lost"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        LOOKING FOR THIS ITEM 😥
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Button>
                    </motion.div>
                </div>

                <p className="text-gray-500">
                    {isFound
                        ? "You’re reporting a found item. Help return it to its owner!"
                        : "You’re reporting a lost item. Let others help you find it!"}
                </p>
            </section>

            {/* ---------- Main Form ---------- */}
            <main className="flex flex-col md:flex-row gap-8 px-10 pb-16">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 bg-white p-8 rounded-xl shadow-sm space-y-8"
                    >
                        {/* Item Name */}
                        <FormField
                            control={form.control}
                            name="itemName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., iPhone 13 Pro" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Electronics">Electronics</SelectItem>
                                            <SelectItem value="Clothing">Clothing</SelectItem>
                                            <SelectItem value="Accessories">Accessories</SelectItem>
                                            <SelectItem value="Documents">Documents</SelectItem>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe your item..." rows={4} {...field} />
                                    </FormControl>
                                    <FormDescription>Include any identifying marks or details.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date / Time / Location */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="dateLost"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{isFound ? "Date Found" : "Date Lost"}</FormLabel>
                                        <Popover open={openDate} onOpenChange={setOpenDate}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="justify-between w-full font-normal">
                                                    {field.value
                                                        ? field.value.toLocaleDateString("en-US", {
                                                            day: "2-digit",
                                                            month: "long",
                                                            year: "numeric",
                                                        })
                                                        : "Select date"}
                                                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setOpenDate(false);
                                                    }}
                                                    disabled={{ after: new Date() }}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Time */}
                            <FormField
                                control={form.control}
                                name="timeLost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{isFound ? "Time Found" : "Time Lost"}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                step="60" // minute precision
                                                suppressHydrationWarning
                                                max={
                                                    isSameDay(form.getValues("dateLost"), new Date())
                                                        ? nowForTimeInput
                                                        : undefined
                                                }
                                                {...field}
                                                className="bg-background"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Location */}
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Location</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Location" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.keys(LOCATIONS).map((key) => (
                                                    <SelectItem key={key} value={key}>
                                                        📍 {key}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Map Preview */}
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => {
                                const selected = field.value && LOCATIONS[field.value];
                                return (
                                    <AnimatePresence mode="wait">
                                        {selected && (
                                            <motion.div
                                                key={field.value}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                transition={{ duration: 0.25 }}
                                                className="mt-4 flex flex-col items-center"
                                            >
                                                <img
                                                    src={`https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/static/pin-s+ff0000(${selected.lng},${selected.lat})/${selected.lng},${selected.lat},16,0/500x300?access_token=${MAPBOX_TOKEN}`}
                                                    alt="Map preview"
                                                    className="rounded-lg shadow-md border cursor-pointer hover:opacity-90 transition"
                                                    onClick={() =>
                                                        window.open(
                                                            `https://www.google.com/maps?q=${selected.lat},${selected.lng}`,
                                                            "_blank"
                                                        )
                                                    }
                                                />
                                                <p className="text-xs text-gray-400 mt-1 text-center italic">
                                                    Click map to open Google Maps
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                );
                            }}
                        />

                        {/* Photos */}
                        <FormField
                            control={form.control}
                            name="photos"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Photos</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = e.target.files;
                                                if (files && files.length > 4) {
                                                    toast.error("You can upload up to 4 photos.");
                                                }
                                                field.onChange(files);
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>Upload clear, well-lit images (up to 4 photos).</FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Contact Info */}
                        <h3 className="text-lg font-semibold mb-4 mt-6">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your.email@sjsu.edu" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white mt-4 transition-colors duration-500 ${isFound ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            {loading
                                ? "Uploading..."
                                : isFound
                                    ? "Report Found Item"
                                    : "Report Lost Item"}
                        </Button>
                    </form>
                </Form>
            </main>
        </div>
    );
}
