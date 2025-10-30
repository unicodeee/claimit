import { z } from "zod";

export const itemSchema = z.object({
  id: z.string(),
  campusId: z.string(),
  category: z.string(),
  claimCount: z.number().default(0),
  createdAt: z.date(),
  description: z.string(),
  images: z.array(z.string()).optional(),
  isFlagged: z.boolean().default(false),
  keywords: z.array(z.string()).optional(),
  lastActivityAt: z.date(),
  location: z.string(),
  ownerUid: z.string(),
  status: z.enum(["open", "claimed", "closed"]).default("open"),
  tags: z.array(z.string()).optional(),
  title: z.string(),
  type: z.enum(["lost", "found"]),
  viewCount: z.number().default(0),
});

export type Item = z.infer<typeof itemSchema>;
