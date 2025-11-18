"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@lib/firebaseConfig";
import { useRouter } from "next/navigation";

const auth = getAuth(app);

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const displayName =
    user?.displayName?.trim() ||
    (user?.email ? user.email.split("@")[0] : "Student");

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-4 bg-white shadow-sm border-b">
      {/* Left: Logo + Brand */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => router.push("/main")}
      >
        {/* public/logo.svg */}
        <Image
          src="/claimit-logo.svg"
          alt="ClaimIt Logo"
          width={28}
          height={28}
          priority
        />
        <span className="text-xl font-bold text-gray-800">ClaimIt</span>
      </div>

      {/* Middle: Nav can be added here */}
      <nav className="hidden md:flex gap-6 text-gray-800 font-large">
        <a href="/main" className="hover:text-blue-600">Home</a>
        <a href="/browse" className="hover:text-blue-600">Browse Items</a>
        <a href="/report-lost" className="hover:text-blue-600">Report Lost</a>
        <a href="/report-found" className="hover:text-blue-600">Report Found</a>
        <a href="/profile" className="hover:text-blue-600">My Profile</a>
      </nav>

      {/* Right: User */}
      <div className="flex items-center gap-3">
        <span className="text-gray-700 text-sm max-w-[180px] truncate">
          {displayName}
        </span>

        {/* photo: should use user photo if available
         */}
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt={displayName}
            width={36}
            height={36}
            className="rounded-full border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {initial}
          </div>
        )}
      </div>
    </header>
  );
}
