import { Suspense } from "react";
import BrowseItemsContent from "./BrowseItemsContent";

export default function BrowsePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowseItemsContent />
    </Suspense>
  );
}