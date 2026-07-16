import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { LocationDoc } from "@/types/firestore";

// `sections` merges over a default -- existing docs saved before that field
// existed lack it entirely, and every consumer (SectionRenderer) assumes an array.
function withDefaults(data: LocationDoc): LocationDoc {
  return { ...data, sections: data.sections ?? [] };
}

const getCachedLocations = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<LocationDoc[]> => {
        const snap = await adminDb!.collection("locations").get();
        return snap.docs.map((d) => withDefaults(d.data() as LocationDoc));
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
        return snap.exists ? withDefaults(snap.data() as LocationDoc) : null;
      },
      [`location-${slug}`],
      { tags: ["locations", `location:${slug}`], revalidate: 3600 }
    );
    return getCached();
  }
  return devStore.getLocation(slug);
}
