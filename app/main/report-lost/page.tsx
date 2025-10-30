"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { app } from "@lib/firebaseConfig";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import {IconButton} from "@/components/ui/icon-button";


const db = getFirestore(app);
const storage = getStorage(app);

export default function ReportLostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [timeLost, setTimeLost] = useState("");
  const [location, setLocation] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1️: upload photos to Firebase Storage
      const photoURLs: string[] = [];

      if (photos && photos.length > 0) {
        for (const file of Array.from(photos)) {
          const storageRef = ref(storage, `lostItems/${file.name}-${Date.now()}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          photoURLs.push(url);
        }
      }

      // Step 2️: save item data to Firestore
      const itemData = {
        itemName,
        category,
        description,
        dateLost,
        timeLost,
        location,
        contactName: name,
        email,
        phone,
        photoURLs,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "items"), itemData);

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

      {/* Main Form Section */}
      <main className="flex flex-col md:flex-row gap-8 px-10 pb-16">
        <form onSubmit={handleSubmit} className="flex-1 bg-white p-8 rounded-xl shadow-sm space-y-8">
          {/* Item Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">Item Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="e.g., iPhone 13 Pro"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="border rounded-md p-2 w-full"
                required
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-md p-2 w-full"
                required
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Accessories</option>
                <option>Documents</option>
              </select>
            </div>
            <textarea
              placeholder="Describe your lost item in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-md p-2 w-full mt-4"
              rows={3}
              required
            />
          </div>

          {/* When & Where */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">When & Where</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
                className="border rounded-md p-2"
                required
              />
              <input
                type="time"
                value={timeLost}
                onChange={(e) => setTimeLost(e.target.value)}
                className="border rounded-md p-2"
              />
              <input
                type="text"
                placeholder="e.g., Central Park, Library"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border rounded-md p-2"
                required
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">Photos</h3>
            <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-500">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setPhotos(e.target.files)}
                className="hidden"
                id="fileUpload"
              />
              <label htmlFor="fileUpload" className="cursor-pointer">
                <p>Upload photos of your lost item</p>
                <Button variant="outline" className="mt-3">Choose Files</Button>
              </label>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">📞 Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded-md p-2"
                required
              />
              <input
                type="email"
                placeholder="your.email@sjsu.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded-md p-2"
                required
              />
              <input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded-md p-2"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white mt-4 w-full hover:bg-blue-700"
          >
            {loading ? "Uploading..." : " Report Lost Item"}
          </Button>
        </form>

        {/* Tips Sidebar */}
        <aside className="w-full md:w-80">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">💡 Tips for Better Results</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li> Be as specific as possible in your description.</li>
              <li> Include unique features or markings.</li>
              <li> Upload clear, high-quality photos.</li>
              <li> Provide accurate location details.</li>
              <li> Check back regularly for matches.</li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-600">
        © 2025 ClaimIt. Helping reunite lost items with their owners.
      </footer> */}
    </div>
  );
}
