"use client";

import { AdminEntityList } from "./AdminEntityList";
import { locationsClient } from "@/lib/firestore/locations.client";
import type { LocationDoc } from "@/types/firestore";

export function LocationsListClient({ locations }: { locations: LocationDoc[] }) {
  return (
    <AdminEntityList
      rows={locations.map((l) => ({ slug: l.slug, title: l.name, subtitle: l.type }))}
      newHref="/admin/locations/new"
      newLabel="New Location"
      editHrefFor={(slug) => `/admin/locations/${slug}/edit`}
      onDelete={(slug) => locationsClient.remove(slug)}
      emptyLabel="No locations yet. Add your first pin to the map."
    />
  );
}
