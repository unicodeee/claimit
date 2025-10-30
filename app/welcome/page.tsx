"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "@lib/firebaseConfig";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {addDoc, collection, limit, onSnapshot, orderBy, query, Timestamp} from "firebase/firestore"
import db from "@lib/firestore";

import { Search } from "lucide-react";

const auth = getAuth(app);

export default function MainLoggedInPage() {
	const [userName, setUserName] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				setUserName(user.displayName); // ✅ get name
			} else {
				setUserName(null);
			}
		});

		const fetchLostItems = async () => {
			try {
				const itemsRef = collection(db, "items");
				const q = query(itemsRef, orderBy("createdAt", "desc"), limit(50));

			}
			catch (e) {
				console.error(e);
			}
		}
		fetchLostItems();

		return () => unsubscribe();
	}, []);


	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.replace("/"); // ✅ redirect after logout
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-6">
			<div className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
				{userName ? (
					<h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
						Welcome, {userName}! 🎉
					</h1>
				) : (
					<h1 className="text-xl text-gray-600 dark:text-gray-300">Loading...</h1>
				)}
			</div>
			<Button onClick={handleLogout} variant="destructive">Log out</Button>
		</div>
	);
}
