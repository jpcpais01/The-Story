"use client";

import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { revalidateTags } from "./revalidate.client";
import type { WorldDoc } from "@/types/firestore";

export async function saveWorld(patch: Partial<WorldDoc>, worldId = "main"): Promise<void> {
  if (isFirebaseConfigured) {
    await setDoc(
      doc(db!, "world", worldId),
      { ...patch, updatedAt: Date.now() },
      { merge: true }
    );
  } else {
    const res = await fetch(`/api/dev/worlds/${worldId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to save world settings");
  }
  await revalidateTags(["world", "worlds"]);
}

/** Creates (or overwrites) a whole world document under its own id. */
export async function createWorld(world: WorldDoc): Promise<void> {
  await saveWorld(world, world.id);
}

export async function deleteWorld(worldId: string): Promise<void> {
  if (worldId === "main") throw new Error("The original Atlas world cannot be deleted");
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db!, "world", worldId));
  } else {
    const res = await fetch(`/api/dev/worlds/${worldId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete world");
  }
  await revalidateTags(["world", "worlds"]);
}
