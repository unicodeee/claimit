"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Coffee, User } from "lucide-react";

const db = getFirestore(app);

interface UserProfile {
  displayName: string;
  email: string;
  phone?: string;
  major?: string;
  photoURL?: string;
  coffeeLink?: string;
  createdAt?: any;
}

interface Item {
  id: string;
  itemName: string;
  description?: string;
  photoURLs?: string[];
  type?: boolean;
  status?: "lost" | "found";
  location?: string;
}

export default function PublicProfilePage() {
  const { uid } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  // Load profile info
  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      const userRef = doc(db, "users", uid as string);
      const snap = await getDoc(userRef);
      if (snap.exists()) setProfile(snap.data() as UserProfile);
    };
    fetchProfile();
  }, [uid]);

  // Load that user's posts
  useEffect(() => {
    const fetchItems = async () => {
      if (!uid) return;
      const q = query(
        collection(db, "items"),
        where("ownerUid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(6)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Item[];
      setItems(data);
    };
    fetchItems();
  }, [uid]);

  if (!profile)
    return <p className="text-center text-gray-500 mt-20">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="max-w-md w-full bg-white shadow-md rounded-xl p-8 flex flex-col items-center text-center mb-10">
        <Image
          src={
            profile.photoURL ||
            `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(
              profile.displayName || "User"
            )}`
          }
          alt="avatar"
          width={100}
          height={100}
          className="rounded-full shadow-md object-cover mb-4"
        />

        <h2 className="text-2xl font-semibold text-gray-800">
          {profile.displayName || "Anonymous"}
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          {profile.major || "No major info"}
        </p>

        {/* Email */}
        <div className="flex items-center gap-2 text-gray-700 mb-1">
          <Mail className="w-4 h-4 text-gray-500" />
          {profile.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {profile.email}
            </a>
          ) : (
            <span className="text-sm text-gray-400">No email</span>
          )}
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-gray-700 mb-3">
          <Phone className="w-4 h-4 text-gray-500" />
          {profile.phone ? (
            <a
              href={`tel:${profile.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {profile.phone}
            </a>
          ) : (
            <span className="text-sm text-gray-400">No phone</span>
          )}
        </div>

        {/* Coffee Link */}
        {profile.coffeeLink && (
          <div className="flex items-center gap-2 mt-2">
            <Coffee className="w-4 h-4 text-purple-500" />
            <a
              href={profile.coffeeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        )}

        <Button variant="outline" className="mt-6" onClick={() => router.back()}>
          ← Back
        </Button>
      </Card>

      {/* -------- Recent Posts Section -------- */}
      <div className="max-w-5xl w-full px-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {profile.displayName?.split(" ")[0] || "User"}’s Recent Posts
        </h3>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-0 border border-gray-200 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition"
                onClick={() => router.push(`/main/item/${item.id}`)}
              >
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  <Image
                    src={item.photoURLs?.[0] ?? "/no-img.png"}
                    alt={item.itemName}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        item.type
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.type ? "FOUND" : "LOST"}
                    </span>
                  </div>
                  <h4 className="text-base font-medium text-gray-900 truncate">
                    {item.itemName}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description || "No description."}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
