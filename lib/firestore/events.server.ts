import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { EventDoc } from "@/types/firestore";

const getCachedEvents = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<EventDoc[]> => {
        const snap = await adminDb!.collection("events").get();
        return snap.docs.map((d) => d.data() as EventDoc);
      },
      ["events-list"],
      { tags: ["events"], revalidate: 3600 }
    )
  : null;

export async function listEvents(): Promise<EventDoc[]> {
  const events = getCachedEvents ? await getCachedEvents() : devStore.listEvents();
  return [...events].sort((a, b) => a.sortValue - b.sortValue);
}

export async function getEvent(slug: string): Promise<EventDoc | null> {
  if (isFirebaseAdminConfigured) {
    const getCached = unstable_cache(
      async (): Promise<EventDoc | null> => {
        const snap = await adminDb!.collection("events").doc(slug).get();
        return snap.exists ? (snap.data() as EventDoc) : null;
      },
      [`event-${slug}`],
      { tags: ["events", `event:${slug}`], revalidate: 3600 }
    );
    return getCached();
  }
  return devStore.getEvent(slug);
}
