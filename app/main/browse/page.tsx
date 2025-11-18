"use client";

import { Suspense } from "react";
import nextDynamic from "next/dynamic";

// only load BrowseItemsContent on client side, 
const BrowseItemsContent = nextDynamic(() => import("./BrowseItemsContent"), {
  ssr: false,
});

export const dynamic = "force-dynamic"; // ensure always fresh data

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading items...</div>}>
      <BrowseItemsContent />
    </Suspense>
  );
}
