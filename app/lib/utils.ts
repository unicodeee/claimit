import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function getItems() {
  const res = await fetch("/api/items"); // calls your GET handler
  if (!res.ok) throw new Error("Failed to fetch items");

  const data = await res.json();
  return data.items; // the array returned by your GET function
}
