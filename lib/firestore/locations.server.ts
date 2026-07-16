import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { LocationDoc } from "@/types/firestore";

const getCachedLocations = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<LocationDoc[]> => {
        const snap = await adminDb!.collection("locations").get();
        return snap.docs.map((d) => d.data() as LocationDoc);
      },
      ["locations-list"],
      { tags: ["locations"], revalidate: 3600 }
    )
  : null;

export async function listLocations(): Promise<LocationDoc[]> {
  if (getCachedLocations) return getCachedLocations();
  return devStore.listLocations();
}

export async function getLocation(slug: string): Promise<LocationDoc | null> {
  if (isFirebaseAdminConfigured) {
    const getCached = unstable_cache(
      async (): Promise<LocationDoc | null> => {
        const snap = await adminDb!.collection("locations").doc(slug).get();
        return snap.exists ? (snap.data() as LocationDoc) : null;
      },
      [`location-${slug}`],
      { tags: ["locations", `location:${slug}`], revalidate: 3600 }
    );
    return getCached();
  }
  return devStore.getLocation(slug);
}
