"use client";

import Image from "next/image";
import {getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup} from "firebase/auth";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
// import app from "@lib/firebaseConfig"; // <-- adjust path to your firebase config
import {app} from "@lib/firebaseConfig";
import {Button} from "@/components/ui/button";
import {IconButton} from "@/components/ui/icon-button";

import {CardLandingGroup} from "@/components/landingpage-card";
import {TextEverythingYouNeed} from "@/components/everything-you-need";

const provider = new GoogleAuthProvider();
const auth = getAuth(app);


export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

// TODO
    // useEffect(() => {
    //     // ✅ Check if user is already signed in
    //     const unsubscribe = onAuthStateChanged(auth, (user) => {
    //         if (user) {
    //             router.replace("/main"); // use replace so login page isn’t in browser history
    //         }
    //     });

    //     return () => unsubscribe();
    // }, [router]);


    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const result = await signInWithPopup(auth, provider);
            console.log("User:", result.user);
            router.push("/main");
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 dark:bg-gray-900">
            <header
                className="flex items-start w-full gap-2 pt-2.5 pb-2.5 pl-30"
            >
                <IconButton/>
                <h1 className="text-3xl font-extrabold tracking-tight text-balance text-black">Claimit</h1>
            </header>

            <div className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] w-full pt-12 pb-12">
                {/*// left block*/}
                <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-start p-8 dark:bg-gray-800 rounded-2xl gap-6 max-w-lg">
                        <h1 className="text-4xl font-extrabold tracking-tight text-balance text-white">
                            Never Lose Your Items Again
                        </h1>
                        <p className="text-sm text-white break-words">
                            ClaimIt helps students find their lost items more efficiently
                            through our smart matching system and real-time
                            communication platform.
                        </p>

                        <Button onClick={handleGoogleLogin}
                                disabled={loading}
                                variant="default"
                                className="flex items-center gap-3 px-6 py-3 bg-transparent border border-white shadow-md hover:bg-gray-100 text-white hover:text-black transition disabled:opacity-50 "
                        >
                            <Image
                                src="/google.svg" // add a Google logo SVG in your public folder
                                alt="Google Logo"
                                width={20}
                                height={20}
                            />
                            {loading ? "Signing in..." : "Sign in with Google"}

                        </Button>
                    </div>
                    <Image
                        alt="Landing"
                        src="/landing-img1.png"
                        width={250}
                        height={250}
                        className="rounded-xl dark:invert shadow-2xl max-w-lg max-h-lg"

                    />
                </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-6 pt-6 pb-6">
                <CardLandingGroup />
            </div>


            <div className="bg-gradient-to-r from-[#2563EB] via-[#9333EA] to-[#4338CA] w-full pt-12 pb-12">
                
                <div className="grid grid-cols-[2fr_1fr] place-items-center">
                    {/*// left block*/}
                    <div className="flex flex-col items-start dark:bg-gray-800 rounded-2xl gap-6 ">
                        <h1 className="text-4xl font-extrabold tracking-tight text-balance text-white">
                            Everything You Need
                        </h1>

                        <TextEverythingYouNeed/>
                    </div>

                    {/* right */}
                    <Image
                        alt="Landing"
                        src="/landing-img2.png"
                        width={250}
                        height={250}
                        className="rounded-xl dark:invert shadow-2xl max-w-lg max-h-lg"

                    />
                </div>
            </div>

        </div>
    );
}
