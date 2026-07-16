"use client";

import { makeCollectionClient } from "./collection-client";
import type { EventDoc } from "@/types/firestore";

export const eventsClient = makeCollectionClient<EventDoc>("events");
