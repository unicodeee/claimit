"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {doc, getDoc} from "firebase/firestore";
import db from "@/lib/firestore";
import {Item} from "@/lib/validators/itemSchema";
import Image from "next/image";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {CalendarDays, Mail, MapPin, Phone} from "lucide-react";

export default function ItemDetailPage() {
    const {id} = useParams();
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);

    const [mainImgIndex, setMainImgIndex] = useState(0);

    useEffect(() => {
        if (!id) return;
        const fetchItem = async () => {
            try {
                const docRef = doc(db, "items", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setItem({id: docSnap.id, ...docSnap.data()} as Item);
                }

                console.log(docSnap.data());
            } catch (err) {
                console.error("Error loading item:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleThubmnailClick =  (index: number) => {
        setMainImgIndex(index);
        return;
    }

    if (loading) return <p className="text-center py-10">Loading item...</p>;
    if (!item) return <p className="text-center py-10">Item not found.</p>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Button variant="ghost" onClick={() => router.back()}>
                ← Back to Browse Items
            </Button>

            <div className="grid md:grid-cols-2 gap-8 mt-6">
                {/* 🖼️ Image Gallery */}
                <div>
                    <div className="relative w-full h-80 rounded-xl overflow-hidden border">
                        <Image
                            src={item.photoURLs?.[mainImgIndex] || "/placeholder.png"}
                            alt={item.itemName || ""}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Thumbnail preview (optional) */}
                    <div className="flex gap-2 mt-3">
                        {item.photoURLs?.slice(0, 4).map((url, index) => (
                            <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                <Button onClick={() => handleThubmnailClick(index)}>
                                    <Image src={url} alt={`Photo ${index + 1}`} fill className="object-cover"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📋 Item Details */}
                <div>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl font-semibold">
                                        {item.itemName}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {item.type === "found" ? "Found Item" : "Lost Item"}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin size={16}/>
                                <span>{item.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays size={16}/>
                                <span>
                                      {item.dateFound
                                          ? new Date(item.dateFound).toLocaleDateString()
                                          : "Date not available"}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed">{item.description}</p>

                            <Button className="w-full mt-2">Contact Finder</Button>

                            {/* Finder Info */}
                            {item.name && (
                                <div className="border-t pt-4 space-y-1 text-sm">
                                    {item.type == "found"
                                        ? <p className="font-medium">Found By {item.name}</p>
                                        : <p className="font-medium">{item.name} is looking for this item.</p>}

                                    {item.email && (
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <Mail size={14}/> {item.email}
                                        </p>
                                    )}
                                    {item.phone && (
                                        <p className="flex items-center gap-1 text-muted-foreground">
                                            <Phone size={14}/> {item.phone}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div
                                className="bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md p-3 mt-4 text-xs">
                                ⚠️ Always meet in a public place when collecting your item. Verify your identity before
                                the exchange.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <footer className="text-center text-xs text-muted-foreground mt-10">
                © 2024 ClaimIt. Helping reunite lost items with their owners.
            </footer>
        </div>
    );
}
