"use client";

import { useEffect, useState, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const db = getFirestore(app);

// Define a strict Message type
interface Message {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderPhoto?: string;
  timestamp?: any; // Firestore timestamp
}

export function ChatBox({ itemId }: { itemId: string }) {
  const { uid, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // If user not logged in, show login prompt instead of chat box
  if (!uid) {
    return (
      <div className="bg-gray-50 border rounded-xl p-6 text-center text-gray-600">
        <p className="mb-3">You must be logged in to message the finder.</p>
        <a
          href="/login"
          className="text-blue-600 underline font-medium hover:text-blue-800"
        >
          Sign in with your SJSU account →
        </a>
      </div>
    );
  }

  // Always call hooks at the top level
  useEffect(() => {
    if (!itemId) return;
    const q = query(
      collection(db, "items", itemId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Message[] = snapshot.docs.map((doc) => {
        const d = doc.data() as DocumentData;
        return {
          id: doc.id,
          text: d.text || "",
          senderUid: d.senderUid || "",
          senderName: d.senderName || "Anonymous",
          senderPhoto: d.senderPhoto || "",
          timestamp: d.timestamp,
        };
      });
      setMessages(data);
    });

    return () => unsubscribe();
  }, [itemId]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "items", itemId, "messages"), {
      text: newMessage.trim(),
      senderUid: uid,
      senderName: user?.displayName || "Anonymous",
      senderPhoto: user?.photoURL || "",
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-[400px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end ${
              msg.senderUid === uid ? "justify-end" : "justify-start"
            }`}
          >
            {msg.senderUid !== uid && msg.senderPhoto && (
              <Image
                src={msg.senderPhoto}
                alt="avatar"
                width={30}
                height={30}
                className="rounded-full mr-2"
              />
            )}
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.senderUid === uid
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 mt-3">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="bg-blue-600 text-white px-4">
          ➤
        </Button>
      </form>
    </div>
  );
}
