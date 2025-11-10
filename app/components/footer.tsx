// components/Footer.tsx
"use client";

import {IconButton} from "@/components/ui/icon-button";
import {useRouter} from "next/navigation";

export function Footer() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push("/")
    }



    return (
        <footer className="flex justify-between items-center bg-white dark:bg-gray-800 py-6 shadow-inner px-6">
            <IconButton onClick={handleGoHome} />

            <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300">
                    © 2025 ClaimIt. Helping reunite lost items with their owners.
                </p>
            </div>
        </footer>
    );
}
