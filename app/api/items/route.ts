import { NextResponse } from "next/server";
import { collection, addDoc, getDocs, orderBy, query, limit, startAfter } from "firebase/firestore";
import db from "@/lib/firestore";
import { itemSchema } from "@/lib/validators/itemSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = itemSchema.parse({ ...body, createdAt: new Date(), lastActivityAt: new Date() });

    const docRef = await addDoc(collection(db, "items"), parsed);
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  let q = query(collection(db, "items"), orderBy("createdAt", "desc"), limit(10));
  if (cursor) q = query(collection(db, "items"), orderBy("createdAt", "desc"), startAfter(cursor), limit(10));

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const lastVisible = snapshot.docs[snapshot.docs.length - 1]?.get("createdAt");

  return NextResponse.json({ items, nextCursor: lastVisible ?? null });
}
