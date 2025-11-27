import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

type Props = {
  title: string;
  description?: string;
  dateFound?: string;   // already formatted (e.g. "3 days ago")
  type?: string;
  location?: string;
  imgUrl?: string;
  keywords?: string[];
  onContactFinder?: () => void;
  buttonText?: string;
  layout?: "vertical" | "horizontal";
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

  const itemType = type?.toLowerCase() ?? "lost";

  return (
    <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      {/* ---------- Header ---------- */}
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg">{title}</CardTitle>

        {itemType === "lost" ? (
          <Badge className="bg-red-500 text-white">LOST</Badge>
        ) : (
          <Badge className="bg-green-500 text-white">FOUND</Badge>
        )}
      </CardHeader>

      {/* ---------- Content ---------- */}
      <CardContent className="flex flex-col justify-between gap-4">
        {/* Image */}
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

        {/* Keywords */}
        {keywords?.length ? (
          <div className="flex flex-wrap gap-1">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                #{keyword}
              </Badge>
            ))}
          </div>
        ) : null}

        {/* Time */}
        {dateFound && (
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {/* Show time component correctly */}
            <span>{dateFound}</span> 
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{location || "Unknown location"}</span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm">{description}</p>
      </CardContent>

      {/* ---------- Footer ---------- */}
      <CardFooter className="flex justify-end">
        <Button
          size="lg"
          onClick={onContactFinder}
          className={`flex items-center gap-2 text-white ${
            itemType === "found"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          {buttonText || (itemType === "found" ? "Contact Finder" : "Contact Owner")}
        </Button>
      </CardFooter>
    </Card>
  );
}
