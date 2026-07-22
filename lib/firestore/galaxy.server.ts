import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { GalaxyDoc } from "@/types/firestore";

const getCachedGalaxy = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<GalaxyDoc> => {
        const snap = await adminDb!.collection("galaxy").doc("main").get();
        // Merge over the seed defaults so a partial write (e.g. only a seed
        // override) never leaves required fields undefined.
        return snap.exists ? { ...devStore.getGalaxy(), ...snap.data() } : devStore.getGalaxy();
      },
      ["galaxy-main"],
      { tags: ["galaxy"], revalidate: 3600 }
    )
  : null;

export async function getGalaxy(): Promise<GalaxyDoc> {
  if (getCachedGalaxy) {
    // `??` guards against a poisoned cache entry (e.g. a value cached while
    // the doc shape was mid-migration in dev) ever reaching pages.
    return (await getCachedGalaxy()) ?? devStore.getGalaxy();
  }
  return devStore.getGalaxy();
}
