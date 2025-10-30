"use client";
import {Header} from "@/components/header";

export default function MainLayout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header always at top */}
            <div >
                <Header />
            </div>


            {/* Page content takes remaining space */}
            <main className="flex-grow">{children}</main>
        </div>
    );
}
