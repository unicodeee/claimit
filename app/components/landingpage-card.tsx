"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHeart, MapPin, MessagesSquare, Shield, TriangleAlert, Users } from "lucide-react";

export interface CardItem {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
}

const cards: CardItem[] = [
    {
        id: 1,
        title: "Trusted by Students",
        description:
            "Thousands of verified users on campus rely on ClaimIt to find and recover lost items safely.",
        icon: Users,
        color: "from-blue-500 to-cyan-400",
    },
    {
        id: 2,
        title: "Secure and Verified",
        description:
            "Our shielded verification system ensures every user and claim is legitimate and safe.",
        icon: Shield,
        color: "from-red-500 to-pink-400",
    },
    {
        id: 3,
        title: "Find Items Fast",
        description:
            "Smart campus-wide tracking and location tagging helps reunite items and owners faster.",
        icon: MapPin,
        color: "from-green-500 to-teal-400",
    },
];

const instructionsCards: CardItem[] = [
    {
        id: 4,
        title: "Report Lost Items",
        description:
            "Lost something? Create a detailed report with photos, description, and location where you last saw your item.",
        icon: TriangleAlert,
        color: "from-yellow-400 to-orange-500",
    },
    {
        id: 5,
        title: "Report Found Items",
        description:
            "Found something? Upload it to our platform so the rightful owner can easily identify and claim their belongings.",
        icon: HandHeart,
        color: "from-yellow-400 to-orange-500",
    },
    {
        id: 6,
        title: "Connect & Chat",
        description:
            "Use our real-time chat feature to connect with other students, verify ownership, and arrange meetups safely.",
        icon: MessagesSquare,
        color: "from-yellow-400 to-orange-500",
    },



]

export function CardLandingPage() {
    return (

        <div className="flex flex-col justify-center items-center gap-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-balance text-black">Welcome to ClaimIt</h1>
            <p className="max-w-lg text-gray-700 text-center">Our platform revolutionizes how students recover lost items on campus. With smart categorization, instant notifications, and secure communication, finding your belongings has never been easier.</p>



            <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                    {cards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card
                                key={card.id}
                                className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-500 to-gray-400 text-white"
                            >
                                <CardHeader className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
                                    >
                                        <Icon className="w-6 h-6"/>
                                    </div>
                                    <CardTitle className="text-lg font-semibold">
                                        {card.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-300">{card.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>


            <h1 className="text-3xl font-extrabold tracking-tight text-balance text-black">How ClaimIt Works</h1>
            <p className="max-w-lg text-gray-700 text-center">Simple steps to reunite you with your lost items</p>

            <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                    {instructionsCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Card
                                key={card.id}
                                className="max-w-xs rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
                            >
                                <CardHeader className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}
                                    >
                                        <Icon className="w-6 h-6"/>
                                    </div>
                                    <CardTitle className="text-lg font-semibold">
                                        {card.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-300">{card.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
