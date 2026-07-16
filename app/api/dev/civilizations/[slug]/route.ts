import { devStore } from "@/lib/dev-store/store";
import { makeCollectionRoutes } from "@/lib/dev-store/route-helpers";
import type { CivilizationDoc } from "@/types/firestore";

export const { PUT, DELETE } = makeCollectionRoutes<CivilizationDoc>({
  upsert: devStore.upsertCivilization,
  remove: devStore.deleteCivilization,
});
