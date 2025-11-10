"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const auth = getAuth(app);
const db = getFirestore(app);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@sjsu.edu")) {
      setError("Please use your official SJSU email.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: fullName });
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: fullName,
        email,
        createdAt: Timestamp.now(),
      });
      router.push("/main");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-md p-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6">Join ClaimIt Today!</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="your.name@sjsu.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500"
            required
          />

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in here
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}
