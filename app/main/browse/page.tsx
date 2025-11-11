"use client";

import { useState, useEffect, useMemo } from "react";
import { Item } from "@/lib/validators/itemSchema";
import { ItemCard } from "@/components/ui/ItemCard";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { onSnapshot, query, collection, orderBy } from "firebase/firestore";
import db from "@/lib/firestore";
import Link from "next/link";

export default function BrowseItemsPage() {
	const [items, setItems] = useState<Item[]>([]);
	const [search, setSearch] = useState("");
	const [type, setType] = useState("all");
	const [category, setCategory] = useState("all");
	const [location, setLocation] = useState("all");
	const [datePosted, setDatePosted] = useState("");

	useEffect(() => {
		const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const items = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Item[];
			setItems(items);
		});
		return unsubscribe;
	}, []);

	// ✅ Filter logic
	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const matchesSearch = item.itemName?.toLowerCase().includes(search.toLowerCase());
			const matchesType = type === "all" || item.type === type;
			const matchesCategory = category === "all" || item.category?.toLowerCase() === category.toLowerCase();
			const matchesLocation = location === "all" || item.location?.toLowerCase() === location.toLowerCase();
			const matchesDate =
				!datePosted ||
				item.createdAt === new Date(datePosted);

			return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesDate;
		});
	}, [items, search, type, category, location, datePosted]);

	const onContactFinder = () => {};

	return (
		<div className="pt-5 grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* 🧭 Filter Panel */}
			<Card className="lg:col-span-1 p-4 space-y-4 max-h-fit">
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Refine your search</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label>Search by name</Label>
						<Input
							type="text"
							placeholder="e.g. wallet, phone..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div>
						<Label>Item Type</Label>
						<RadioGroup
							value={type}
							onValueChange={setType}
							className="flex flex-wrap gap-2 mt-2"
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="all" id="all" />
								<Label htmlFor="all">All</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="lost" id="lost" />
								<Label htmlFor="lost">Lost</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem value="found" id="found" />
								<Label htmlFor="found">Found</Label>
							</div>
						</RadioGroup>
					</div>

					<div>
						<Label>Category</Label>
						<Select value={category} onValueChange={setCategory}>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="electronics">Electronics</SelectItem>
								<SelectItem value="clothing">Clothing</SelectItem>
								<SelectItem value="documents">Documents</SelectItem>
								<SelectItem value="accessories">Accessories</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Location</Label>
						<Select value={location} onValueChange={setLocation}>
							<SelectTrigger>
								<SelectValue placeholder="Select location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="campus">Campus</SelectItem>
								<SelectItem value="library">Library</SelectItem>
								<SelectItem value="cafeteria">Cafeteria</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label>Date Posted</Label>
						<Input
							type="date"
							value={datePosted}
							onChange={(e) => setDatePosted(e.target.value)}
						/>
					</div>

					<Button
						variant="secondary"
						onClick={() => {
							setSearch("");
							setType("all");
							setCategory("all");
							setLocation("all");
							setDatePosted("");
						}}
						className="w-full"
					>
						Reset Filters
					</Button>
				</CardContent>
			</Card>

			{/* 📋 Item List */}
			<Card className="lg:col-span-3 border-none focus:outline-none shadow-none">
				<CardHeader>
					<CardTitle>Items</CardTitle>
					<CardDescription>Showing {filteredItems.length} results</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredItems.length === 0 ? (
						<p className="text-center text-muted-foreground py-10">
							No items found. Try adjusting your filters.
						</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredItems.map((item) => (

								<Link key={item.id} href={`/main/items/${item.id}`}>
									<ItemCard
										key={item.id}
										title={item.itemName}
										type={item.type}
										dateFound={item.dateFound}
										location={item.location}
										description={item.description}
										imgUrl={item.photoURLs?.[0] ?? undefined}
										keywords={item.keywords}
										onContactFinder={onContactFinder}
									/>
								</Link>
							))}
						</div>
					)}
				</CardContent>
				<CardFooter></CardFooter>
			</Card>
		</div>
	);
}
