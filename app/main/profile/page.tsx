"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { onSnapshot, doc, getDoc, query, setDoc, updateDoc, deleteDoc, collection, where, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes, deleteObject } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
});

interface Item {
  id: string;
  itemName: string;
  description: string;
  location: string;
  type: boolean;
  category?: string;
  photoURLs?: string[]; // optional array of photo URLs
}

export default function ProfilePage() {
  const router = useRouter();
  const { uid } = useAuth();

  const [userName, setUserName] = useState<string>("User");
  const [email, setEmail] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string>("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [filterType, setFilterType] = useState<"lost" | "found" | "all">("all");
  const [editingItem, setEditingItem] = useState<Item | null>(null); // currently editing item
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "" },
  });

  // ✅ Update Username + Firestore
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: values.username });
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: values.username,
          email,
          major,
          phone,
          photoURL,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setUserName(values.username);
      alert("Username updated!");
    }
  }

  // 🔐 Load user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) router.replace("/");
      else {
        setUserName(user.displayName || "User");
        setEmail(user.email || "");

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.major) setMajor(data.major);
          if (data.phone) setPhone(data.phone);
          if (data.photoURL) setPhotoURL(data.photoURL);
        } else {
          await setDoc(userRef, {
            displayName: user.displayName || "User",
            email: user.email,
            major: "",
            phone: "",
            photoURL: "",
            createdAt: serverTimestamp(),
          });
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 📦 Fetch user's items
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "items"), where("ownerUid", "==", uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Item[];
      setItems(data);
    });
    return () => unsubscribe();
  }, [uid]);

  // 🗑 Delete item
  const handleDelete = async (id: string) => {
    try {
      // 1️⃣ Get the Firestore document of this item
      const itemRef = doc(db, "items", id);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const data = itemSnap.data();

        // 2️⃣ If there are photos, delete each one from Firebase Storage
        if (data.photoURLs && Array.isArray(data.photoURLs)) {
          for (const fullURL of data.photoURLs) {
            try {
              // Extract the file path from the full download URL
              // For example:
              // "https://firebasestorage.googleapis.com/v0/b/.../o/items%2FX1wavED18JdTX4IINRmA9OY4iz2%2Fphoto.jpg?alt=media&token=..."
              const path = decodeURIComponent(fullURL.split("/o/")[1].split("?")[0]);

              // Get a reference to the file in Storage and delete it
              const fileRef = ref(storage, path);
              await deleteObject(fileRef);
              console.log(`✅ Deleted photo: ${path}`);
            } catch (err) {
              console.warn(`⚠️ Failed to delete photo ${fullURL}:`, err);
            }
          }
        }
      }

      // 3️⃣ Delete the Firestore document itself
      await deleteDoc(itemRef);

      // 4️⃣ Update UI state to remove the deleted item
      setItems((prev) => prev.filter((i) => i.id !== id));

      toast.success("Item and related photos deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting item:", err);
      toast.error("Failed to delete item. Please try again.");
    }
  };

  // 🧾 Update user info (major / phone)
  const handleInfoUpdate = async (field: "major" | "phone", newValue: string) => {
    setEditingField(null);
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), {
      [field]: newValue,
      updatedAt: serverTimestamp(),
    });
    if (field === "major") setMajor(newValue);
    if (field === "phone") setPhone(newValue);
    toast.success(`${field} updated successfully!`);
  };

  // 📸 Upload avatar (replace old one if exists)
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    setLoading(true);
    try {
      // delete old avatar if exists
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const oldURL = userDoc.data().photoURL;
        if (oldURL) {
          try {
            const oldRef = ref(storage, oldURL);
            await deleteObject(oldRef);
            console.log("Old avatar deleted successfully.");
          } catch (err) {
            console.warn("Old avatar deletion skipped or failed:", err);
          }
        }
      }

      // upload new avatar
      const newRef = ref(storage, `avatars/${uid}-${Date.now()}`);
      await uploadBytes(newRef, file);
      const newURL = await getDownloadURL(newRef);

      // update Firestore + Auth profile
      await updateDoc(doc(db, "users", uid), {
        photoURL: newURL,
        updatedAt: serverTimestamp(),
      });
      const user = auth.currentUser;
      if (user) await updateProfile(user, { photoURL: newURL });

      setPhotoURL(newURL);
      toast.success("Profile photo updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to update avatar.");
    } finally {
      setLoading(false);
    }
  };


  // ➕ Add New
  const handleAddNew = () => {
    const target = filterType === "found" ? "/main/report-found" : "/main/report-lost";
    const returnTo = "/main/profile";
    const type = filterType === "found" ? "found" : "lost";
    router.push(`${target}?type=${type}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  // Save edited item
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const refDoc = doc(db, "items", editingItem.id);
      await updateDoc(refDoc, {
        itemName: editingItem.itemName,
        description: editingItem.description,
        location: editingItem.location,
        category: editingItem.category || "",
        updatedAt: serverTimestamp(),
      });
      alert("Item updated!");
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      alert("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  // 📸 Update item photo (inside edit dialog)
  const handleImageUpdate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem || !uid) return;

    // limit to 4 photos
    if ((editingItem.photoURLs?.length || 0) >= 4) {
      alert("You can only upload up to 4 photos per item.");
      e.target.value = ""; // clear the input
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const storageRef = ref(storage, `items/${uid}-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // update photoURLs array in Firestore
      const updatedPhotos = [...(editingItem.photoURLs || []), url];
      await updateDoc(doc(db, "items", editingItem.id), {
        photoURLs: updatedPhotos,
        updatedAt: serverTimestamp(),
      });

      // asynchronously update local state, immdiately show new photo in UI
      setEditingItem({ ...editingItem, photoURLs: updatedPhotos });
      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload photo");
    } finally {
      setLoading(false);
    }
  };


  const avatarSrc =
    photoURL ||
    `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(userName)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex flex-col md:flex-row gap-6 px-10 py-10">
        {/* Left Profile */}
        <Card className="md:w-1/3 bg-white shadow-md rounded-xl">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative">
              <Image
                src={avatarSrc}
                alt="avatar"
                width={100}
                height={100}
                className="rounded-full shadow-md object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white text-xs hover:bg-indigo-700"
              >
                ✎
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUploadAvatar}
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-semibold mt-4">{userName}</h2>
            <p className="text-gray-500 text-sm mb-4">Computer Science Student</p>

            <EditableRow label="Email" value={email} editable={false} />
            <EditableRow
              label="Major"
              value={major}
              editable
              isEditing={editingField === "major"}
              onEdit={() => setEditingField("major")}
              onSave={handleInfoUpdate}
            />
            <EditableRow
              label="Phone"
              value={phone}
              editable
              isEditing={editingField === "phone"}
              onEdit={() => setEditingField("phone")}
              onSave={handleInfoUpdate}
            />
          </CardContent>
        </Card>

        {/* Right Items */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Posted Items</h2>
            <div className="flex items-center gap-3">
              <select
                className="border border-gray-300 rounded-lg p-2 text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "lost" | "found" | "all")}
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
                <option value="all">All</option>
              </select>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddNew}>
                + Add New
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.length > 0 ? (
              items
                .filter((i) =>
                  filterType === "all" ? true : filterType === "found" ? i.type : !i.type
                )
                .map((item) => (
                  < ItemCard
                    key={item.id}
                    name={item.itemName}
                    desc={item.description}
                    type={item.type}
                    location={item.location}
                    photoURLs={item.photoURLs}
                    onEdit={() => setEditingItem(item)}  // when edit icon clicked
                    onDelete={() => handleDelete(item.id)}
                  />
                ))
            ) : (
              <p className="text-gray-500 text-center py-6">
                No items posted yet. Start by adding one!
              </p>
            )}
          </div>
        </div>
      </main>

      {/* edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <Input
                value={editingItem.itemName}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, itemName: e.target.value })
                }
                placeholder="Item name"
              />
              <Textarea
                value={editingItem.description}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
                placeholder="Description"
              />
              {/* 🖼️ Image Upload */}
              <div>
                <Label className="text-sm text-gray-600">Add or Replace Photos</Label>
                <Input type="file" accept="image/*" onChange={handleImageUpdate} />
                {/* photo preview */}
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {(editingItem.photoURLs || []).map((url, idx) => (
                    <Image
                      key={idx}
                      src={url}
                      alt={`photo-${idx}`}
                      width={80}
                      height={80}
                      className="rounded-md border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              </div>

              <Input
                value={editingItem.location}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, location: e.target.value })
                }
                placeholder="Location"
              />
              <Input
                value={editingItem.category || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, category: e.target.value })
                }
                placeholder="Category"
              />
              <Button
                className="w-full bg-indigo-600 text-white"
                disabled={loading}
                onClick={handleSaveEdit}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --- Subcomponents --- */
function EditableRow({ label, value, editable, isEditing, onEdit, onSave }: any) {
  const [temp, setTemp] = useState(value);
  return (
    <div className="w-full bg-gray-50 p-3 rounded-lg mb-3">
      <Label className="text-sm text-gray-500">{label}</Label>
      {isEditing ? (
        <div className="flex gap-2 mt-1">
          <Input value={temp} onChange={(e) => setTemp(e.target.value)} className="text-sm" />
          <Button size="sm" onClick={() => onSave(label.toLowerCase(), temp)}>
            Save
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center mt-1">
          <p className={`text-sm ${value ? "text-gray-800" : "text-gray-400 italic"}`}>
            {value || `Click ✎ to add your ${label.toLowerCase()}`}
          </p>

          {editable && (
            <Button variant="ghost" size="icon" onClick={onEdit}>
              ✎
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Each item card showing image + text details
function ItemCard({ name, desc, type, location, photoURLs, onEdit, onDelete }: any) {
  return (
    <Card className="p-0 shadow-sm border border-gray-200 overflow-hidden rounded-xl">
      {/* ---------- IMAGE SECTION ---------- */}
      <div className="relative w-full bg-gray-100">
        {/* Using a fixed aspect ratio for consistent layout */}
        <div className="relative w-full aspect-[4/3]">
          <Image
            src={photoURLs?.[0] ?? "/no-img.png"} // first image or placeholder
            alt={name}
            fill
            className="object-contain bg-gray-100"
          />
        </div>
      </div>

      {/* ---------- TEXT SECTION ---------- */}
      <div className="p-4">
        {/* Header with LOST / FOUND tag + icons */}
        <div className="flex justify-between items-start">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${type ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
          >
            {type ? "FOUND" : "LOST"}
          </span>

          {/* Edit/Delete icons (optional) */}
          <div className="flex gap-2 text-gray-400 cursor-pointer">
            <span title="Edit" onClick={onEdit}>✎</span>
            <Dialog>
              <DialogTrigger asChild>
                <span title="Delete" className="cursor-pointer">🗑️</span>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete this item?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. The item and its related photos will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={onDelete}>
                      Confirm Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </div>

        {/* ---------- ITEM DETAILS ---------- */}
        <h3 className="font-semibold mt-2 text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{desc}</p>
        <p className="text-xs text-gray-500 mt-1">📍 {location}</p>
      </div>
    </Card>
  );
}

