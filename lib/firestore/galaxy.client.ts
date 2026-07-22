"use client";

import { doc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { revalidateTags } from "./revalidate.client";
import type { GalaxyDoc } from "@/types/firestore";

export async function saveGalaxy(patch: Partial<GalaxyDoc>): Promise<void> {
  if (isFirebaseConfigured) {
    await setDoc(
      doc(db!, "galaxy", "main"),
      { ...patch, updatedAt: Date.now() },
      { merge: true }
    );
  } else {
    const res = await fetch("/api/dev/galaxy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to save galaxy settings");
  }
  await revalidateTags(["galaxy"]);
}

/** Writes a fresh random seed for one system, changing it forever after. */
export async function regenerateSystem(systemId: string): Promise<void> {
  const seed = Math.floor(Math.random() * 2 ** 31);
  await saveGalaxy({ systemSeedOverrides: { [systemId]: seed } });
}
