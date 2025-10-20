// app/components/Header.tsx
"use client";



import {NavigationMenuDemo} from "@/components/nav";


export function Header() {
    return (
        <header className="flex items-center justify-center w-full bg-white dark:bg-gray-900 shadow">
            <NavigationMenuDemo />
        </header>


    );
}