"use client"

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { app } from "@lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { NavigationAppMenu } from "@/components/nav";
import { AuthProvider } from "@/lib/auth-context";
import Image from "next/image";

const auth = getAuth(app);

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [userName, setUserName] = useState<string>("User");
    const [photoURL, setPhotoURL] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || "User");
                setPhotoURL(
                    user.photoURL ||
                    `https://api.dicebear.com/9.x/avataaars/png?seed=${encodeURIComponent(
                        user.displayName || "default"
                    )}`
                );
            } else {
                router.replace("/");
            }
        });

        return () => unsubscribe();
    }, [router]);


    const handleLogout = async () => {
        await signOut(auth);
        router.replace("/");
    };

    return (
        <>
            <header className="flex items-center justify-between px-10 py-4 bg-white shadow-sm border-b">
                <div className="flex items-center gap-2">
                    <h1
                        className={`font-medium text-sm md:text-lg px-3 py-2 transition-all duration-300 
                                    bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent 
                                    hover:from-blue-600 hover:to-purple-600 cursor-pointer`}
                        onClick={() => router.push("/main")}
                    >
                        ClaimIt
                    </h1>

                </div>

                <NavigationAppMenu />

                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                        onClick={() => router.push("/main/profile")}
                    >
                        <Image
                            src={photoURL || "https://api.dicebear.com/9.x/avataaars/png?seed=default"}
                            alt="Profile photo"
                            width={32}
                            height={32}
                            className="rounded-full border border-gray-200 object-cover"
                        />
                        <span className="text-gray-700">{userName}</span>
                    </div>
                    <Button
                        variant="outline"
                        className="text-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </header>
            <main className="flex-grow">
                <AuthProvider>{children}</AuthProvider>
            </main>
        </>
    );
}