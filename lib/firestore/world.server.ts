import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { WorldDoc } from "@/types/firestore";

const getCachedWorld = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<WorldDoc> => {
        const snap = await adminDb!.collection("world").doc("main").get();
        return snap.exists ? (snap.data() as WorldDoc) : devStore.getWorld();
      },
      ["world-main"],
      { tags: ["world"], revalidate: 3600 }
    )
  : null;

export async function getWorld(): Promise<WorldDoc> {
  if (getCachedWorld) return getCachedWorld();
  return devStore.getWorld();
}
