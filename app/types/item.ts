// =============================
// FILE: /types/item.ts
// Zod schema + TypeScript types for Items
// =============================
import { z } from "zod";

export const ItemSchema = z.object({
  campusId: z.string().min(1),
  category: z.string().min(1),
  claimCount: z.number().int().nonnegative().default(0),
  description: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  isFlagged: z.boolean().default(false),
  keywords: z.array(z.string()).default([]),
  location: z.string().min(1),
  ownerUid: z.string().min(1),
  status: z.enum(["open", "claimed", "closed"]).default("open"),
  tags: z.array(z.string()).default([]),
  title: z.string().min(1),
  type: z.enum(["lost", "found"]).default("lost"),
  viewCount: z.number().int().nonnegative().default(0),
});

export type ItemInput = z.infer<typeof ItemSchema>;

export type Item = ItemInput & {
  id: string;
  createdAt: Date; // derived from Firestore Timestamp
  lastActivityAt?: Date | null;
};
