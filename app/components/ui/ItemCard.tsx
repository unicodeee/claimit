import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/lib/validators/itemSchema";
import { MapPin } from "lucide-react";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

type Props = Pick<
    Item,
    "title" | "dateFound" | "location" | "keywords" | "description" | "type"
> & {
    imgUrl?: string;
    onContactFinder?: () => void;
    buttonText?: string;
};

export function ItemCard({
    title,
    description,
    dateFound,
    type,
    location,
    imgUrl,
    keywords,
    onContactFinder,
    buttonText,
}: Props) {
    const created =
        typeof dateFound === "string" ? new Date(dateFound) : dateFound;

    return (
        <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300">
            {/* ---------- Header ---------- */}
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-lg">{title}</CardTitle>
                {type?.toLowerCase() === "lost" ? (
                    <Badge className="bg-red-500 text-white">{type.toUpperCase()}</Badge>
                ) : (
                    <Badge className="bg-green-500 text-white">{type?.toUpperCase()}</Badge>
                )}
            </CardHeader>

            {/* ---------- Content ---------- */}
            <CardContent className="flex flex-col justify-between gap-4">
                <AspectRatio ratio={4 / 3}>
                  <div className="bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden">
                    <Image
                        src={imgUrl ?? "/no-img.png"}
                        alt="Item image"
                        fill
                        className="object-contain"
                    />
                  </div>
                </AspectRatio>

                {/* keywords */}
                {keywords?.length ? (
                    <div className="flex flex-wrap gap-1">
                        {keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary">
                                #{keyword}
                            </Badge>
                        ))}
                    </div>
                ) : null}

                {/* location */}
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{location || "Unknown location"}</span>
                </div>

                <p className="text-gray-700 text-sm">{description}</p>
            </CardContent>

            {/* ---------- Footer ---------- */}
            <CardFooter className="flex justify-end">
                <Button
                    size="lg"
                    onClick={onContactFinder}
                    className={`flex items-center gap-2 text-white ${type === "found"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                >
                    <MessageSquare className="h-5 w-5" />
                    {buttonText || (type === "found" ? "Contact Finder" : "Contact Owner")}
                </Button>
            </CardFooter>
        </Card>
    );
}
