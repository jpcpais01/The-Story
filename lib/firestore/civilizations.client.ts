"use client";

import { makeCollectionClient } from "./collection-client";
import type { CivilizationDoc } from "@/types/firestore";

export const civilizationsClient = makeCollectionClient<CivilizationDoc>("civilizations");
