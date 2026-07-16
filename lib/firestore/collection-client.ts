"use client";

import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { revalidateTags } from "./revalidate.client";

export function makeCollectionClient<Doc extends { slug: string; createdAt: number; updatedAt: number }>(
  collectionName: "locations" | "civilizations" | "events"
) {
  type SaveInput = Omit<Doc, "createdAt" | "updatedAt"> & { createdAt?: number };

  async function save(entry: SaveInput): Promise<void> {
    const now = Date.now();
    const stamped = { ...entry, createdAt: entry.createdAt ?? now, updatedAt: now };
    if (isFirebaseConfigured) {
      await setDoc(doc(db!, collectionName, entry.slug), stamped, { merge: true });
    } else {
      const res = await fetch(`/api/dev/${collectionName}/${entry.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stamped),
      });
      if (!res.ok) throw new Error(`Failed to save ${collectionName} entry`);
    }
    await revalidateTags([collectionName, `${collectionName.slice(0, -1)}:${entry.slug}`]);
  }

  async function remove(slug: string): Promise<void> {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db!, collectionName, slug));
    } else {
      const res = await fetch(`/api/dev/${collectionName}/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete ${collectionName} entry`);
    }
    await revalidateTags([collectionName, `${collectionName.slice(0, -1)}:${slug}`]);
  }

  return { save, remove };
}
