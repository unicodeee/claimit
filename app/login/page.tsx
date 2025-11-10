"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/AuthLayout";

const auth = getAuth(app);
const db = getFirestore(app);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@sjsu.edu")) {
      setError("Please use your official SJSU email.");
      return;
    }

    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, "users", userCred.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        setError("You must register first before signing in.");
        return;
      }

      router.push("/main");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-md p-10 border border-gray-100">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
            🎓
          </div>
          <h2 className="text-2xl font-bold text-gray-800">SJSU Sign In</h2>
          <p className="text-sm text-gray-500">Enter your SJSU email to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-md py-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-sm text-center mt-5">
          <a href="/register" className="text-blue-600 hover:underline">
            Register
          </a>{" "}
          •{" "}
          <a href="#" className="text-gray-500 hover:underline">
            Reset Password
          </a>
        </div>
      </div>
    </AuthLayout>
  );
}
