"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { CardLandingPage } from "@/components/landingpage-card";
import { TextEverythingYouNeed } from "@/components/everything-you-need";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const db = getFirestore(app);

export default function WelcomePage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/main"); // use replace so login page isn’t in browser history
      }
    });
    return () => unsubscribe();
  }, [router]);

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000); // show error for 4 seconds
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ only allow SJSU emails
      if (!user.email?.endsWith("@sjsu.edu")) {
        showError("❌ Only SJSU email addresses are allowed.");
        await signOut(auth);
        return;
      }

      // ✅ check if user is registered in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showError("⚠️ You must register your SJSU account before logging in.");
        await signOut(auth);
        return;
      }

      // ✅ everything's good, redirect to main page
      router.push("/main");
    } catch (err) {
      console.error("Login failed:", err);
      showError("❌ Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-start w-full p-4">
        <Image src="/search-icon.svg" alt="ClaimIt" width={28} height={28} />
        <h1 className="text-3xl font-extrabold tracking-tight ml-2">ClaimIt</h1>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] w-full py-16">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-8">
          {/* Left text block */}
          <div className="flex flex-col items-start text-white max-w-lg gap-6">
            <h1 className="text-4xl font-extrabold leading-tight">
              Never Lose Your Items Again
            </h1>
            <p className="text-sm opacity-90">
              ClaimIt helps students find their lost items efficiently
              through our smart matching system and real-time
              communication platform.
            </p>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="default"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-white text-white hover:bg-white hover:text-black transition"
            >
              <Image
                src="/google.svg"
                alt="Google Logo"
                width={20}
                height={20}
              />
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>

            {/* Email Login Option */}
            <p className="text-sm mt-3 text-white">
              or{" "}
              <a
                href="/login"
                className="underline font-semibold hover:text-gray-200"
              >
                Use your SJSU Email
              </a>
            </p>

            {errorMsg && (
              <div className="bg-white/20 text-white font-medium px-4 py-2 rounded-lg mt-4 animate-fadeIn">
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right image */}
          <Image
            src="/landing-img1.png"
            alt="Landing Illustration"
            width={300}
            height={300}
            className="rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* Info Section 1 */}
      <section className="flex flex-col justify-center items-center py-10 gap-6">
        <CardLandingPage />
      </section>

      {/* Info Section 2 */}
      <section className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] w-full py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 place-items-center px-10">
          {/* Left text */}
          <div className="flex flex-col text-white gap-6 max-w-lg">
            <h1 className="text-4xl font-extrabold">Everything You Need</h1>
            <TextEverythingYouNeed />
          </div>

          {/* Right image */}
          <Image
            src="/landing-img2.png"
            alt="Features"
            width={300}
            height={300}
            className="rounded-xl shadow-2xl"
          />
        </div>
      </section>
    </div>
  );
}
