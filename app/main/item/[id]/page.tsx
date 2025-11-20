"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatBox } from "@/components/chatbox";
import { ShieldAlert, ChevronLeft, ChevronRight, Phone, Mail, User, Coffee } from "lucide-react";

const db = getFirestore(app);

interface Item {
  id: string;
  itemName: string;
  description?: string;
  location?: string;
  category?: string;
  type?: boolean | string;
  status?: "lost" | "found";
  ownerUid?: string;
  createdAt?: any;
  dateFound?: any;
  photoURLs?: string[];
  email?: string;
  name?: string;
  phone?: string;
  coffeeLink?: string;
}

// format Firestore timestamp to readable date
function formatFirestoreDate(date: any) {
  if (!date) return "Unknown";
  if (date.toDate) return date.toDate().toLocaleDateString();
  return String(date);
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [item, setItem] = useState<Item | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const docRef = doc(db, "items", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() } as Item);
    };
    fetchItem();
  }, [id]);

  if (!item) return <p className="text-center text-gray-500 mt-20">Loading...</p>;

  const photos = item.photoURLs ?? [];

  const nextImage = () => {
    if (!photos.length) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    if (!photos.length) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-6 py-10">
        {/* ---------- LEFT COLUMN ---------- */}
        <div className="flex-[3] min-w-0">
          {/* ---------- IMAGE CAROUSEL ---------- */}
          <div className="relative w-full rounded-xl overflow-hidden bg-gray-100 mb-6">
            {photos.length ? (
              <>
                <Image
                  src={photos[currentIndex]}
                  alt={item.itemName}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain transition-all duration-300"
                  priority
                />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {currentIndex + 1} / {photos.length}
                </div>
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1.5 shadow"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-1.5 shadow"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                No image uploaded
              </div>
            )}
          </div>

          {/* ---------- ITEM INFO ---------- */}
          <h1 className="text-2xl font-semibold mb-2">{item.itemName}</h1>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <div className="text-sm text-gray-500 space-y-1 mb-6">
            <p>📍 Location: {item.location || "Unknown"}</p>
            <p>📅 Date: {formatFirestoreDate(item.dateFound)}</p>
            <p>📂 Category: {item.category || "Uncategorized"}</p>
          </div>

          {/* ---------- CHAT BUTTON ---------- */}
          <Button
            variant={item.status === "found" ? "found" : "lost"}
            className="mb-8 transition-transform duration-150 active:scale-95"
            onClick={() => {
              setShowChat(true);
              setTimeout(() => {
                document.getElementById("chat-box")?.scrollIntoView({ behavior: "smooth" });
              }, 200);
            }}
          >
            💬 {item.status === "found" ? "Chat with Finder" : "Chat with Owner"}
          </Button>

          {/* ---------- CHAT SECTION ---------- */}
          {showChat && (
            <div id="chat-box" className="mt-10">
              <h2 className="text-xl font-semibold mb-3">
                {item.status === "found" ? "Chat with Finder" : "Chat with Owner"}
              </h2>
              <ChatBox itemId={item.id} />
            </div>
          )}
        </div>

        {/* ---------- RIGHT SIDEBAR ---------- */}
        <div className="flex-[1] flex flex-col gap-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-3 text-gray-800">
              {item.status === "found" ? "Finder Information" : "Owner Information"}
            </h3>

            <div className="space-y-2 text-gray-700">
              {/* Finder Name */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                {item.ownerUid ? (
                  <span
                    className="font-medium text-blue-600 hover:underline cursor-pointer"
                    onClick={() => router.push(`/main/profile/${item.ownerUid}`)}
                  >
                    {item.name || "Anonymous"}
                  </span>
                ) : (
                  <span className="font-medium">{item.name || "Anonymous"}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                {item.email ? (
                  <a
                    href={`mailto:${item.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {item.email}
                  </a>
                ) : (
                  <span className="text-sm text-gray-600">No email</span>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                {item.phone ? (
                  <a
                    href={`tel:${item.phone}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {item.phone}
                  </a>
                ) : (
                  <span className="text-sm text-gray-600">No phone</span>
                )}
              </div>

              {/* Buy Me a Coffee */}
              {item.status === "found" && item.coffeeLink && (
                <div className="flex items-center gap-2 mt-2">
                  <Coffee className="w-4 h-4 text-purple-500" />
                  <a
                    href={item.coffeeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Buy me a coffee
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* ---------- SAFETY TIPS ---------- */}
          <Card className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3 items-start">
            <ShieldAlert className="text-amber-500 w-5 h-5 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">Safety Tips</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Always meet in a public place when collecting your item. Verify ownership before
                the exchange. Never share sensitive personal information.
              </p>
            </div>
          </Card>

          {/* ---------- BACK BUTTON ---------- */}
          <Button variant="outline" className="w-full mt-2" onClick={() => router.back()}>
            ← Back to Browse
          </Button>
        </div>
      </div>
    </div>
  );
}
