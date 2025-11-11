import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  itemName: z.string().optional(),
  campusId: z.string().optional(),
  category: z.string().optional(),
  claimCount: z.number().default(0).optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),   // Firestore Timestamp or string
  description: z.string().optional(),
  photoURLs: z.array(z.string()).optional(),
  isFlagged: z.boolean().default(false).optional(),
  keywords: z.array(z.string()).optional(),
  dateFound: z.union([z.date(), z.string()]).optional(),
  lastActivityAt: z.union([z.date(), z.string()]).optional(),
  location: z.string().optional(),
  ownerUid: z.string().optional(),
  status: z.enum(["open", "claimed", "closed"]).default("open").optional(),
  tags: z.array(z.string()).optional(),
  title: z.string().optional(),
  type: z.enum(["lost", "found"]).optional(),
  viewCount: z.number().default(0).optional(),

  email: z.email().optional(),
  name: z.string().optional(),
  phone: z.string().length(10).optional(),
});

export type Item = z.infer<typeof itemSchema>;
