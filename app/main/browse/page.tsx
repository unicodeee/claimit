
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Item } from "@/lib/validators/itemSchema";
import { getItems } from "@/lib/utils";
import { NavigationAppMenu } from "@/components/nav";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

export default function BrowseItemsPage() {

	const [items, setItems] = useState<Item[]>([]);

	useEffect(() => {
		const fetchItems = async () => {
			const items = await getItems();
			setItems(items);
		}
		fetchItems();
	}, []);



	return (

		<div>
			<NavigationAppMenu />
			
			<h1>Lost & Found Items</h1>
			<p>xxx Items found</p>




			<Card className="w-full max-w-sm">
				<CardHeader>
					<Badge variant="destructive">Badge</Badge>
					{/* <CardTitle>Card Title</CardTitle>
					<CardDescription>Card Description</CardDescription>
					<CardAction>Card Action</CardAction> */}
				</CardHeader>
				<CardContent>


					<Image
						src="/hero-people.png"
						alt="Community illustration"
						width={350}
						height={250}
						className="rounded-xl mt-10 md:mt-0 shadow-2xl"
					/>
					{/* <p>Card Content</p> */}
				</CardContent>
				<CardFooter>
					<div className="flex flex-col gap-2">
						{items.map((item) => (
							<div key={item.id}>
								<h2>{item.title}</h2>
								<p>{item.description}</p>
							</div>
						))}
					</div>
				</CardFooter>
			</Card>
		</div>



		// 	<div> 


		// item type:radio group


		// category, location, date posted: Combobox




		// empty

		// 	</div>


	);
}




