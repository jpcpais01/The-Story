import { devStore } from "@/lib/dev-store/store";
import { makeCollectionRoutes } from "@/lib/dev-store/route-helpers";
import type { EventDoc } from "@/types/firestore";

export const { PUT, DELETE } = makeCollectionRoutes<EventDoc>({
  upsert: devStore.upsertEvent,
  remove: devStore.deleteEvent,
});
