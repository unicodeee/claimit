"use client";

import { useEffect, useState, useRef } from "react";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import { useAuth } from "@/lib/auth-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const db = getFirestore(app);

export function ChatBox({ itemId }: { itemId: string }) {
  const { uid, user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
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

  // Load messages
  useEffect(() => {
    const q = query(
      collection(db, "items", itemId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [itemId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
