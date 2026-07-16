import "server-only";
import type {
  WorldDoc,
  LocationDoc,
  CivilizationDoc,
  EventDoc,
} from "@/types/firestore";
import { seedWorld, seedLocations, seedCivilizations, seedEvents } from "./seed";

/**
 * In-memory data store used only when no Firebase project is configured yet
 * (see lib/firebase/admin.ts / client.ts). Lets the whole app -- including the
 * admin CRUD flows -- be built and clicked through before you've created your
 * Firebase and Cloudinary accounts. Kept on `globalThis` so it survives dev-server
 * hot reloads. Never used once real Firebase env vars are present.
 */
interface DevStore {
  world: WorldDoc;
  locations: Map<string, LocationDoc>;
  civilizations: Map<string, CivilizationDoc>;
  events: Map<string, EventDoc>;
}

const globalForStore = globalThis as unknown as { __devStore?: DevStore };

function createStore(): DevStore {
  return {
    world: { ...seedWorld },
    locations: new Map(seedLocations.map((l) => [l.slug, l])),
    civilizations: new Map(seedCivilizations.map((c) => [c.slug, c])),
    events: new Map(seedEvents.map((e) => [e.slug, e])),
  };
}

const store = globalForStore.__devStore ?? (globalForStore.__devStore = createStore());

export const devStore = {
  getWorld: (): WorldDoc => store.world,
  updateWorld: (patch: Partial<WorldDoc>): WorldDoc => {
    store.world = { ...store.world, ...patch, updatedAt: Date.now() };
    return store.world;
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
