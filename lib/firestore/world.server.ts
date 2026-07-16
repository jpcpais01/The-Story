import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { WorldDoc } from "@/types/firestore";

const getCachedWorld = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<WorldDoc> => {
        const snap = await adminDb!.collection("world").doc("main").get();
        // Merge over the placeholder defaults rather than trusting the stored
        // doc outright -- a partial write (e.g. saving just the procedural
        // heightmap seed before the full World Settings form was ever
        // submitted) would otherwise leave required fields undefined.
        return snap.exists ? { ...devStore.getWorld(), ...snap.data() } : devStore.getWorld();
      },
      ["world-main"],
      { tags: ["world"], revalidate: 3600 }
    )
  : null;

export async function getWorld(): Promise<WorldDoc> {
  if (getCachedWorld) return getCachedWorld();
  return devStore.getWorld();
}
