"use client"


import {CardItem} from "@/components/landingpage-card";
import {Check} from "lucide-react";
import {Card, CardTitle} from "@/components/ui/card";


const cards : CardItem[] = [
    {
        id: 1,
        title: "Easy Item Upload",
        description:
            "Upload a photo and description of a found item in just a few clicks.",
        icon: Check,
        color: "from-blue-500 to-cyan-400",
    },
    {
        id: 2,
        title: "Quick Search & Filters",
        description:
            "Search lost items by category, location, or date posted.",
        icon: Check,
        color: "from-blue-500 to-cyan-400",
    },
    {
        id: 3,
        title: "Secure Chat System",
        description:
            "Built-in messaging system for safe communication between students.",
        icon: Check,
        color: "from-blue-500 to-cyan-400",
    },
]


export function TextEverythingYouNeed() {

    return <div className="w-full max-w-6xl">
        <div className="grid  gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (


                            // <div
                            //     className={`p-1 rounded-full bg-gradient-to-br ${card.color} text-white shadow-lg`}
                            // >
                            //     <Icon className="w-6 h-6"/>
                            // </div>


                    <Card
                        key={card.id}
                        className=" flex rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br bg-transparent text-white border-transparent"
                    >
                        <div className="grid grid-cols-[auto_1fr] items-center gap-4 pl-4">
                            {/* icon */}
                            <div className={`p-1 rounded-full bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                <Icon className="w-6 h-6"/>
                            </div>

                            <div className="flex flex-col">
                                <CardTitle className="text-lg font-semibold">
                                    {card.title}
                                </CardTitle>
                                <p className="text-sm text-gray-300 ">{card.description}</p>
                            </div>
                        </div>
                        {/* <p className="text-sm text-gray-300 ">{card.description}</p> */}
                    </Card>
                );
            })}
        </div>
    </div>

}



