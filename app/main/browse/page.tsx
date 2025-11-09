
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Item } from "@/lib/validators/itemSchema";
import { getItems } from "@/lib/utils";
import { NavigationAppMenu } from "@/components/nav";

import { z } from "zod";

import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge";
import { ItemCard } from "@/components/ui/ItemCard";

import { onSnapshot, query, collection, orderBy } from "firebase/firestore";
import db from "@/lib/firestore";

export default function BrowseItemsPage() {

	const [items, setItems] = useState<Item[]>([]);

	// // useEffect(() => {
	// // 	const fetchItems = async () => {
	// // 		const items = await getItems();
	// // 		console.log("Fetched items:", items); // ✅ Log here
	// // 		setItems(items);
	// // 	}
	// // 	fetchItems();
	// // }, []);





	useEffect(() => {
		const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			setItems(items);
		});
		return unsubscribe; // cleanup
	}, []);

	const onContactFinder = () => { };


	return (
		<div className="text-2xl font-bold mb-2">
			<Card className="w-full">
				
				<CardContent>
					<div className="flex gap-20">
						{items.map((item) => (

							<div>

								<ItemCard
									key={item.id}
									title={item.itemName}
									dateFound={item.dateFound}
									location={item.location}
									description={item.description}
									// imgUrl={item.images?.[0] ?? "/hero-people.png"} // TO DO
									imgUrl={"/hero-people.png"}
									keywords={item.keywords}

									onContactFinder={onContactFinder} />


								


							</div>

						))}


					</div>
				</CardContent>
				<CardFooter>


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




