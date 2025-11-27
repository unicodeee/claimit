"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ItemCard } from "@/components/ui/ItemCard";
import {Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter,} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import db from "@/lib/firestore";

interface FirestoreItem {
  id: string;
  itemName: string;
  description?: string;
  location?: string;
  category?: string;
  type?: boolean | string;
  status?: "lost" | "found";
  createdAt?: any; // Firestore Timestamp
  dateFound?: any;
  photoURLs?: string[];
  email?: string;
}

const ITEMS_PER_PAGE = 6;

function normalizeStatus(data: any): "lost" | "found" {
  if (typeof data?.type === "boolean") return data.type ? "found" : "lost";
  if (typeof data?.type === "string")
    return data.type.toLowerCase() === "found" ? "found" : "lost";
  if (typeof data?.status === "string")
    return data.status.toLowerCase() === "found" ? "found" : "lost";
  return "lost";
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// simple “x days ago / x hours ago” formatter
function formatTimeAgo(createdAt: any): string {
  const date =
    createdAt?.toDate?.() instanceof Date
      ? createdAt.toDate()
      : createdAt instanceof Date
      ? createdAt
      : null;

  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

// generate page numbers with ellipsis, e.g. [1, 2, 3, "ellipsis", 10]
function getPageNumbers(totalPages: number, currentPage: number) {
  const pages: (number | "ellipsis")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  if (left > 2) {
    pages.push("ellipsis");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}

type SortOption = "recent" | "oldest" | "lost-first" | "found-first";
type ViewMode = "grid" | "list";

export default function BrowseItemsContent() {
  const [items, setItems] = useState<FirestoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const params = useSearchParams();
  const initialType = (params.get("type") as "all" | "lost" | "found") || "all";
  const [type, setType] = useState<"all" | "lost" | "found">(initialType);
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [datePosted, setDatePosted] = useState("");

  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);

  // load items from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData: FirestoreItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const status = normalizeStatus(data);
          return { id: doc.id, ...data, status } as FirestoreItem;
        });
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading items:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // when filters change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, type, category, location, datePosted, sortBy]);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch =
        (item.itemName || "").toLowerCase().includes(search.toLowerCase());

      const matchesType = type === "all" || item.status === type;

      const matchesCategory =
        category === "all" ||
        (item.category || "").toLowerCase() === category.toLowerCase();

      const matchesLocation =
        location === "all" ||
        (item.location || "").toLowerCase() === location.toLowerCase();

      const matchesDate =
        !datePosted ||
        isSameDay(item.createdAt?.toDate?.(), new Date(datePosted));

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesLocation &&
        matchesDate
      );
    });

    // sort items
    const sorted = [...filtered].sort((a, b) => {
      const dateA =
        a.createdAt?.toDate?.() instanceof Date
          ? a.createdAt.toDate()
          : new Date(0);
      const dateB =
        b.createdAt?.toDate?.() instanceof Date
          ? b.createdAt.toDate()
          : new Date(0);

      switch (sortBy) {
        case "recent":
          return dateB.getTime() - dateA.getTime();
        case "oldest":
          return dateA.getTime() - dateB.getTime();
        case "lost-first":
          if (a.status === b.status) {
            return dateB.getTime() - dateA.getTime();
          }
          return a.status === "lost" ? -1 : 1;
        case "found-first":
          if (a.status === b.status) {
            return dateB.getTime() - dateA.getTime();
          }
          return a.status === "found" ? -1 : 1;
        default:
          return 0;
      }
    });

    return sorted;
  }, [items, search, type, category, location, datePosted, sortBy]);

  const totalResults = filteredAndSortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(start, end);
  }, [filteredAndSortedItems, currentPage]);

  const pageNumbers = getPageNumbers(totalPages, currentPage);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="pt-2 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1 p-4 space-y-4 max-h-fit lg:sticky lg:top-24">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </div>
              <button
                className="text-xs text-blue-600 hover:underline"
                type="button"
                onClick={() => {
                  setSearch("");
                  setType("all");
                  setCategory("all");
                  setLocation("all");
                  setDatePosted("");
                  setSortBy("recent");
                }}
              >
                Clear All
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Search Items</Label>
              <Input
                type="text"
                placeholder="Search by item name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Item Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as "all" | "lost" | "found")}
                className="flex flex-col gap-2 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All Items</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost Items</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found Items</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="campus">Campus</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="cafeteria">Cafeteria</SelectItem>
                  <SelectItem value="gym">Gym</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date Posted</Label>
              <Input
                type="date"
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
                className="mt-1"
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
                setSortBy("recent");
              }}
              className="w-full mt-2"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>

        {/* List + Controls */}
        <Card className="lg:col-span-3 border-none shadow-none">
          <CardHeader className="pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lost &amp; Found Items</CardTitle>
              <CardDescription>
                {loading
                  ? "Loading..."
                  : `${totalResults} item${totalResults === 1 ? "" : "s"} found`}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort by */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as SortOption)}
                >
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="lost-first">Lost First</SelectItem>
                    <SelectItem value="found-first">Found First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-1 rounded-md border px-1 py-1">
                <Button
                  type="button"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="px-3"
                  onClick={() => setViewMode("grid")}
                >
                  Grid
                </Button>
                <Button
                  type="button"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="px-3"
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {!loading && paginatedItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No items found. Try adjusting your filters.
              </p>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedItems.map((item) => (
                      <Link key={item.id} href={`/main/item/${item.id}`}>
                        <ItemCard
                          title={item.itemName}
                          type={item.status || "lost"}
                          dateFound={
                            item.dateFound
                              ? formatTimeAgo(item.dateFound)
                              : formatTimeAgo(item.createdAt)
                          }
                          location={item.location}
                          description={item.description}
                          imgUrl={item.photoURLs?.[0] ?? undefined}
                          buttonText={
                            item.status === "found"
                              ? "Contact Finder"
                              : "Contact Owner"
                          }
                        />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {paginatedItems.map((item) => (
                      <Link key={item.id} href={`/main/item/${item.id}`}>
                        <ItemCard
                          layout="horizontal"
                          title={item.itemName}
                          type={item.status ?? "lost"}
                          dateFound={
                            item.dateFound
                              ? formatTimeAgo(item.dateFound)
                              : formatTimeAgo(item.createdAt)
                          }
                          location={item.location}
                          description={item.description}
                          imgUrl={item.photoURLs?.[0] ?? undefined}
                          buttonText={
                            item.status === "found"
                              ? "Contact Finder"
                              : "Contact Owner"
                          }
                        />
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                    >
                      Previous
                    </Button>

                    {pageNumbers.map((p, idx) =>
                      p === "ellipsis" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <Button
                          key={p}
                          size="sm"
                          variant={p === currentPage ? "default" : "outline"}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter />
        </Card>
      </div>
    </div>
  );
}
