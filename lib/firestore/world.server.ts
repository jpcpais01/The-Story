import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { WorldDoc } from "@/types/firestore";

/** Fills any missing fields on a stored world with the placeholder defaults --
 * a partial write (e.g. saving just a seed) must never leave required fields
 * undefined. Identity fields always win from the stored doc. */
function withDefaults(id: string, data: FirebaseFirestore.DocumentData | undefined): WorldDoc {
  return { ...devStore.getWorld(), systemId: null, planetName: null, ...data, id };
}

const getCachedWorldById = isFirebaseAdminConfigured
  ? unstable_cache(
      async (id: string): Promise<WorldDoc | null> => {
        const snap = await adminDb!.collection("world").doc(id).get();
        if (!snap.exists) return id === "main" ? devStore.getWorld() : null;
        return withDefaults(id, snap.data());
      },
      ["world-by-id"],
      { tags: ["world", "worlds"], revalidate: 3600 }
    )
  : null;

const getCachedWorldList = isFirebaseAdminConfigured
  ? unstable_cache(
      async (): Promise<WorldDoc[]> => {
        const snap = await adminDb!.collection("world").get();
        const worlds = snap.docs.map((d) => withDefaults(d.id, d.data()));
        if (!worlds.some((w) => w.id === "main")) worlds.push(devStore.getWorld());
        return worlds.sort((a, b) =>
          a.id === "main" ? -1 : b.id === "main" ? 1 : a.name.localeCompare(b.name)
        );
      },
      ["world-list"],
      { tags: ["world", "worlds"], revalidate: 3600 }
    )
  : null;

/** The original Atlas world. */
export async function getWorld(): Promise<WorldDoc> {
  if (getCachedWorldById) return (await getCachedWorldById("main")) ?? devStore.getWorld();
  return devStore.getWorld();
}

export async function getWorldById(id: string): Promise<WorldDoc | null> {
  if (getCachedWorldById) return getCachedWorldById(id);
  return devStore.getWorldById(id);
}

export async function listWorlds(): Promise<WorldDoc[]> {
  if (getCachedWorldList) return getCachedWorldList();
  return devStore.listWorlds();
}
