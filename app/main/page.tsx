"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  limit,
} from "firebase/firestore";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

const auth = getAuth(app);
const db = getFirestore(app);

interface Item {
  id: string;
  itemName: string;
  description?: string;
  location?: string;
  category?: string;
  status?: "lost" | "found";
  photoURLs?: string[];
  createdAt?: any;
}

export default function MainDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const router = useRouter();

  // useEffect to check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
      } else {
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // read recent items from Firestore
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
      setRecentItems(items);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  // format Firestore date
  function formatFirestoreDate(date: any) {
    if (!date) return "Unknown";
    if (date.toDate) return date.toDate().toLocaleDateString();
    return String(date);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] text-white py-14 px-10 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-xl space-y-4">
          <h1 className="text-4xl font-extrabold leading-tight">
            Reunite with Your Lost Items
          </h1>
          <p className="opacity-90">
            Connect with your community to find lost belongings and help others recover theirs.
          </p>
          <div className="flex gap-4 mt-6">
            <Button
              variant="hero"
              onClick={() => router.push("/main/report-lost")}
            >
              Report Lost Item
            </Button>
            <Button
              variant="hero"
              onClick={() => router.push("/main/browse?type=found")}
            >
              Browse Found Items
            </Button>
          </div>
        </div>
        <Image
          src="/hero-people.png"
          alt="Community illustration"
          width={350}
          height={250}
          className="rounded-xl mt-10 md:mt-0 shadow-2xl"
        />
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-10 bg-white text-center">
        <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
        <p className="text-gray-600 mb-8">
          Choose how you’d like to help or get help
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 border-t-4 border-red-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">I Lost Something</h3>
              <p className="text-sm text-gray-600">
                Report your lost item and get help from others.
              </p>
              <Button
                variant="lost" size ="lg" className="w-full"                
                onClick={() => router.push("/main/report-lost")}
              >
                Report Lost
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 border-t-4 border-green-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">I Found Something</h3>
              <p className="text-sm text-gray-600">
                Help others by reporting what you’ve found.
              </p>
              <Button
                variant="found" size ="lg" className="w-full"
                onClick={() => router.push("/main/report-lost?type=found")}
              >
                Report Found
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 border-t-4 border-blue-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">Browse Items</h3>
              <p className="text-sm text-gray-600">
                Search through all lost and found items.
              </p>
              <Button
                variant="gradient" size ="lg" className="w-full" 
                onClick={() => router.push("/main/browse?type=all")}
              >
                Start Browsing
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Lost & Found Items */}
      <section className="py-12 px-10 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Lost & Found Items</h2>
          <a
            href="/main/browse?type=all"
            className="text-blue-600 hover:underline text-sm"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition">
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={item.photoURLs?.[0] ?? "/no-img.png"}
                    alt={item.itemName}
                    fill
                    className="object-contain bg-gray-100 rounded-t-md"
                  />
                </AspectRatio>
                <CardContent className="p-4 space-y-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold text-white rounded ${item.status === "lost"
                      ? "bg-red-500"
                      : "bg-green-500"
                      }`}
                  >
                    {item.status?.toUpperCase()}
                  </span>
                  <h3 className="font-semibold truncate">{item.itemName}</h3>
                  <p className="text-sm text-gray-500">
                    {formatFirestoreDate(item.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                  <Button
                    variant={item.status === "lost" ? "lost" : "found"}
                    className="w-full mt-2"
                    onClick={() => router.push(`/main/item/${item.id}`)}
                  >
                    {item.status?.toString().toLowerCase() === "lost"
                      ? "Contact Owner"
                      : "Contact Finder"}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-4">
              No recent items posted yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
