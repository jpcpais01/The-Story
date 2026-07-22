import "server-only";
import type {
  WorldDoc,
  LocationDoc,
  CivilizationDoc,
  EventDoc,
  GalaxyDoc,
} from "@/types/firestore";
import { seedWorld, seedLocations, seedCivilizations, seedEvents, seedGalaxy } from "./seed";

/**
 * In-memory data store used only when no Firebase project is configured yet
 * (see lib/firebase/admin.ts / client.ts). Lets the whole app -- including the
 * admin CRUD flows -- be built and clicked through before you've created your
 * Firebase and Cloudinary accounts. Kept on `globalThis` so it survives dev-server
 * hot reloads. Never used once real Firebase env vars are present.
 */
interface DevStore {
  worlds: Map<string, WorldDoc>;
  galaxy: GalaxyDoc;
  locations: Map<string, LocationDoc>;
  civilizations: Map<string, CivilizationDoc>;
  events: Map<string, EventDoc>;
}

const globalForStore = globalThis as unknown as { __devStore?: DevStore };

function createStore(): DevStore {
  return {
    worlds: new Map([[seedWorld.id, { ...seedWorld }]]),
    galaxy: { ...seedGalaxy },
    locations: new Map(seedLocations.map((l) => [l.slug, l])),
    civilizations: new Map(seedCivilizations.map((c) => [c.slug, c])),
    events: new Map(seedEvents.map((e) => [e.slug, e])),
  };
}

const store = globalForStore.__devStore ?? (globalForStore.__devStore = createStore());

export const devStore = {
  // `??=` heals a dev store cached on globalThis from before worlds became a
  // map (hot reload keeps the old object alive).
  getWorld: (): WorldDoc => {
    store.worlds ??= new Map([[seedWorld.id, { ...seedWorld }]]);
    let main = store.worlds.get("main");
    if (!main) {
      main = { ...seedWorld };
      store.worlds.set("main", main);
    }
    return main;
  },
  getWorldById: (id: string): WorldDoc | null => {
    if (id === "main") return devStore.getWorld();
    store.worlds ??= new Map([[seedWorld.id, { ...seedWorld }]]);
    return store.worlds.get(id) ?? null;
  },
  listWorlds: (): WorldDoc[] => {
    devStore.getWorld(); // ensures the map + main exist
    return Array.from(store.worlds.values()).sort((a, b) =>
      a.id === "main" ? -1 : b.id === "main" ? 1 : a.name.localeCompare(b.name)
    );
  },
  updateWorld: (patch: Partial<WorldDoc>, id = "main"): WorldDoc => {
    const current = devStore.getWorldById(id) ?? { ...seedWorld, id };
    const next = { ...current, ...patch, id, updatedAt: Date.now() };
    store.worlds.set(id, next);
    return next;
  },
  deleteWorld: (id: string): void => {
    if (id === "main") return; // the original Atlas world is not deletable
    devStore.getWorld();
    store.worlds.delete(id);
  },

  // `??=` heals a dev store cached on globalThis from before the galaxy field
  // existed (hot reload keeps the old object alive).
  getGalaxy: (): GalaxyDoc => (store.galaxy ??= { ...seedGalaxy }),
  updateGalaxy: (patch: Partial<GalaxyDoc>): GalaxyDoc => {
    store.galaxy = {
      ...(store.galaxy ?? { ...seedGalaxy }),
      ...patch,
      systemSeedOverrides: {
        ...store.galaxy.systemSeedOverrides,
        ...patch.systemSeedOverrides,
      },
      updatedAt: Date.now(),
    };
    return store.galaxy;
  },

  listLocations: (): LocationDoc[] =>
    Array.from(store.locations.values()).sort((a, b) => a.name.localeCompare(b.name)),
  getLocation: (slug: string): LocationDoc | null => store.locations.get(slug) ?? null,
  upsertLocation: (doc: LocationDoc): LocationDoc => {
    const existing = store.locations.get(doc.slug);
    const next: LocationDoc = {
      ...doc,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    store.locations.set(doc.slug, next);
    return next;
  },
  deleteLocation: (slug: string): void => {
    store.locations.delete(slug);
  },

  listCivilizations: (): CivilizationDoc[] =>
    Array.from(store.civilizations.values()).sort((a, b) => a.title.localeCompare(b.title)),
  getCivilization: (slug: string): CivilizationDoc | null =>
    store.civilizations.get(slug) ?? null,
  upsertCivilization: (doc: CivilizationDoc): CivilizationDoc => {
    const existing = store.civilizations.get(doc.slug);
    const next: CivilizationDoc = {
      ...doc,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    store.civilizations.set(doc.slug, next);
    return next;
  },
  deleteCivilization: (slug: string): void => {
    store.civilizations.delete(slug);
  },

  listEvents: (): EventDoc[] =>
    Array.from(store.events.values()).sort((a, b) => a.sortValue - b.sortValue),
  getEvent: (slug: string): EventDoc | null => store.events.get(slug) ?? null,
  upsertEvent: (doc: EventDoc): EventDoc => {
    const existing = store.events.get(doc.slug);
    const next: EventDoc = {
      ...doc,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    store.events.set(doc.slug, next);
    return next;
  },
  deleteEvent: (slug: string): void => {
    store.events.delete(slug);
  },
};
