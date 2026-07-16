"use client";

import { makeCollectionClient } from "./collection-client";
import type { LocationDoc } from "@/types/firestore";

export const locationsClient = makeCollectionClient<LocationDoc>("locations");
