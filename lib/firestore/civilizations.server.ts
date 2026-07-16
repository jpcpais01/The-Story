import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { CivilizationDoc } from "@/types/firestore";

const getCachedCivilizations = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<CivilizationDoc[]> => {
        const snap = await adminDb!.collection("civilizations").get();
        return snap.docs.map((d) => d.data() as CivilizationDoc);
      },
      ["civilizations-list"],
      { tags: ["civilizations"], revalidate: 3600 }
    )
  : null;

export async function listCivilizations(): Promise<CivilizationDoc[]> {
  if (getCachedCivilizations) return getCachedCivilizations();
  return devStore.listCivilizations();
}

export async function getCivilization(slug: string): Promise<CivilizationDoc | null> {
  if (isFirebaseAdminConfigured) {
    const getCached = unstable_cache(
      async (): Promise<CivilizationDoc | null> => {
        const snap = await adminDb!.collection("civilizations").doc(slug).get();
        return snap.exists ? (snap.data() as CivilizationDoc) : null;
      },
      [`civilization-${slug}`],
      { tags: ["civilizations", `civilization:${slug}`], revalidate: 3600 }
    );
    return getCached();
  }
  return devStore.getCivilization(slug);
}
