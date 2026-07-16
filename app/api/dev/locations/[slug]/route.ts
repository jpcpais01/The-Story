import { devStore } from "@/lib/dev-store/store";
import { makeCollectionRoutes } from "@/lib/dev-store/route-helpers";
import type { LocationDoc } from "@/types/firestore";

export const { PUT, DELETE } = makeCollectionRoutes<LocationDoc>({
  upsert: devStore.upsertLocation,
  remove: devStore.deleteLocation,
});
