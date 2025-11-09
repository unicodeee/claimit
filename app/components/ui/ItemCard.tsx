

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, UserPlus } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// import { formatDistanceToNow } from "date-fns";
import { Item } from "@/lib/validators/itemSchema";
import { MapPin } from 'lucide-react';


type Props = Pick<Item, "title" | "dateFound" | "location" | "keywords"> & {
    imgUrl?: string;
    onContactFinder?: () => void;
};


export function ItemCard({ title, dateFound, location, imgUrl, keywords, onContactFinder }: Props) {
    const created = typeof dateFound === "string" ? new Date(dateFound) : dateFound;
    return (
        <Card className="rounded-2xl shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {/* <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(created, { addSuffix: true })}
                </div> */}

            </CardHeader>

            <CardContent className="flex flex-col justify-between gap-4">
                <Image
                    src={imgUrl ?? "/placeholder.png"}  // ✅ fallback
                    alt="Community illustration"
                    width={350}
                    height={250}
                    className="rounded-xl mt-10 md:mt-0 shadow-2xl"
                />

                {/* badge */}
                <div className="flex gap-1">
                    {keywords?.map((keyword) => (
                        <Badge variant="destructive">{'#' + keyword}</Badge>
                    ))}
                </div>

                {/* location */}
                <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground w-5 h-5" />
                    <Button
                        variant="link"
                        size="lg"
                        onClick={onContactFinder}
                        className="p-0 h-auto text-lg"
                    >
                        {location}
                    </Button>
                </div>



            </CardContent>

            <CardFooter className="flex justify-end">
                <Button size="lg" onClick={onContactFinder}>
                    <MessageSquare className="mr-2 h-8 w-8" /> Contact finder
                </Button>

            </CardFooter>
        </Card>
    );
}

