"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {useRouter} from "next/navigation";
import {app} from "@lib/firebaseConfig";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";

const auth = getAuth(app);

export default function MainDashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

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

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

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
            Join thousands who’ve successfully reunited with their valuables.
          </p>
          <div className="flex gap-4 mt-6">
            <Button
              className="bg-white text-blue-700 font-semibold hover:bg-gray-100"
              onClick={() => router.push("/main/report-lost")}
            >
              Report Lost Item
            </Button>
            <Button
              variant="secondary"
              className="bg-transparent border border-white hover:bg-white hover:text-blue-700"
              onClick={() => router.push("/main/browse")}
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
        <p className="text-gray-600 mb-8">Choose how you’d like to help or get help</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 border-t-4 border-red-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">I Lost Something</h3>
              <p className="text-sm text-gray-600">Report your lost item and get help from others.</p>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => router.push("/main/report-lost")}
              >
                Report Lost
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 border-t-4 border-green-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">I Found Something</h3>
              <p className="text-sm text-gray-600">Help others by reporting what you’ve found.</p>
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700 w-full"
                onClick={() => router.push("/main/report-found")}
              >
                Report Found
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 border-t-4 border-blue-400">
            <CardContent className="space-y-3">
              <h3 className="font-semibold text-lg">Browse Items</h3>
              <p className="text-sm text-gray-600">Search through all lost and found items.</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/main/browse")}
              >
                Start Browsing
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Lost Items */}
      <section className="py-12 px-10 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Lost Items</h2>
          <a href="/browse" className="text-blue-600 hover:underline text-sm">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { id: 1, label: "LOST", color: "red", name: "iPhone 13 Pro Blue", days: "3 days ago", place: "Central Park", button: "Contact Owner" },
            { id: 2, label: "FOUND", color: "green", name: "Black Leather Wallet", days: "1 day ago", place: "Coffee Shop Main St", button: "Contact Finder" },
            { id: 3, label: "LOST", color: "red", name: "Red Nike Backpack", days: "5 days ago", place: "University Library", button: "Contact Owner" },
            { id: 4, label: "FOUND", color: "green", name: "Car Keys with Remote", days: "2 hours ago", place: "Parking Lot B", button: "Contact Finder" },
          ].map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-md">
              <Image
                src={`/item-${item.id}.png`}
                alt={item.name}
                width={300}
                height={200}
                className="w-full h-40 object-cover"
              />
              <CardContent className="p-4 space-y-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold text-white rounded ${
                    item.color === "red" ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {item.label}
                </span>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.days}</p>
                <p className="text-sm text-gray-500">{item.place}</p>
                <Button
                  className={`w-full mt-2 ${
                    item.color === "red"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {item.button}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
