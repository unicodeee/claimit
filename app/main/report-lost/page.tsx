"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@lib/firebaseConfig";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";

const db = getFirestore(app);
const storage = getStorage(app);

const formSchema = z.object({
    itemName: z.string().min(2, "Item name must be at least 2 characters."),
    category: z.string().min(1, "Please select a category."),
    description: z.string().min(10, "Please provide a detailed description."),
    dateLost: z.date({ required_error: "Please pick a date." }),
    timeLost: z.string().optional(),
    location: z.string().min(2, "Please enter a valid location."),
    name: z.string().min(2, "Please enter your full name."),
    email: z.string().email("Invalid email address."),
    phone: z.string().optional(),
    photos: z.any().optional(),
});

export default function ReportLostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openDate, setOpenDate] = useState(false);

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
            timeLost: new Date().toTimeString().slice(0, 5),
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const fileList = values.photos as FileList | null;
            const photoURLs: string[] = [];

            if (fileList && fileList.length > 0) {
                for (const file of Array.from(fileList)) {
                    const storageRef = ref(storage, `lostItems/${file.name}-${Date.now()}`);
                    await uploadBytes(storageRef, file);
                    const url = await getDownloadURL(storageRef);
                    photoURLs.push(url);
                }
            }

            const { photos, ...cleanData } = values;

            await addDoc(collection(db, "items"), {
                ...cleanData,
                dateLost: Timestamp.fromDate(values.dateLost),
                photoURLs,
                createdAt: Timestamp.now(),
            });

            alert("Lost item successfully submitted!");
            router.push("/main");
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Page Header */}
            <section className="px-10 py-10 text-center">
                <h2 className="text-2xl font-semibold mb-2">
                    Help reunite lost items with their owners or find what you’ve lost
                </h2>
                <div className="flex justify-center gap-4 mt-4">
                    <Button className="bg-blue-600 text-white">Lost Item</Button>
                    <Button variant="outline" onClick={() => router.push("/report-found")}>
                        Found Item
                    </Button>
                </div>
            </section>

            {/* Main Form */}
            <main className="flex flex-col md:flex-row gap-8 px-10 pb-16">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 bg-white p-8 rounded-xl shadow-sm space-y-8"
                    >
                        <h3 className="text-lg font-semibold mb-4">Item Details</h3>

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
                                        <Textarea
                                            placeholder="Describe your lost item..."
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Include any identifying marks or details.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Time Pickers */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Date Picker */}
                            <FormField
                                control={form.control}
                                name="dateLost"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date Lost</FormLabel>
                                        <Popover open={openDate} onOpenChange={setOpenDate}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-between w-full font-normal"
                                                >
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
                                            <PopoverContent
                                                align="start"
                                                className="w-auto p-0"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setOpenDate(false);
                                                    }}
                                                    captionLayout="dropdown"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Time Picker */}
                            <FormField
                                control={form.control}
                                name="timeLost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time Lost</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="time"
                                                step="1"
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
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Central Park, Library" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                            onChange={(e) => field.onChange(e.target.files)}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Upload clear, high-quality images of your lost item.
                                    </FormDescription>
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

                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 text-white">
                            {loading ? "Uploading..." : "Report Lost Item"}
                        </Button>
                    </form>
                </Form>

                {/* Tips Sidebar */}
                <aside className="w-full md:w-80">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold mb-4">💡 Tips for Better Results</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li>Be specific in your description.</li>
                            <li>Include unique identifiers or marks.</li>
                            <li>Upload clear, well-lit photos.</li>
                            <li>Provide an accurate location and date.</li>
                            <li>Check back regularly for matches.</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
}
