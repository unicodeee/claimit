"use client"

import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {useRouter} from "next/navigation";
import {app} from "@lib/firebaseConfig";
import {Button} from "@/components/ui/button";
import {NavigationAppMenu} from "@/components/nav";
import {AuthProvider} from "@/lib/auth-context";

const auth = getAuth(app);

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [userName, setUserName] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserName(user.displayName || "User");
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
                    <h1 className="text-xl font-bold text-gray-800">ClaimIt</h1>
                </div>

                <NavigationAppMenu />

                <div className="flex items-center gap-4">
                    <span className="text-gray-700">{userName}</span>
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