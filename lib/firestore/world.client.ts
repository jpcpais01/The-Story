"use client";

import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { revalidateTags } from "./revalidate.client";
import type { WorldDoc } from "@/types/firestore";

export async function saveWorld(patch: Partial<WorldDoc>): Promise<void> {
  if (isFirebaseConfigured) {
    await setDoc(
      doc(db!, "world", "main"),
      { ...patch, updatedAt: Date.now() },
      { merge: true }
    );
  } else {
    const res = await fetch("/api/dev/world", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to save world settings");
  }
  await revalidateTags(["world"]);
}
