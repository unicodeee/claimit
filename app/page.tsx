"use client";

import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import app from "@lib/firebaseConfig"; // <-- adjust path to your firebase config


import { app } from "@lib/firebaseConfig";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);


export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();



  useEffect(() => {
    // ✅ Check if user is already signed in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/main"); // use replace so login page isn’t in browser history
      }
    });

    return () => unsubscribe();
  }, [router]);



  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      router.push("/main");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-2xl gap-6">
        <Image
          src="/laf.png"
          alt="App Logo"
          width={120}
          height={30}
          className="dark:invert"
        />
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100 transition disabled:opacity-50 text-black"
        >
          <Image
            src="/google.svg" // add a Google logo SVG in your public folder
            alt="Google Logo"
            width={20}
            height={20}
          />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
