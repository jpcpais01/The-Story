"use client";

import { AdminEntityList } from "./AdminEntityList";
import { civilizationsClient } from "@/lib/firestore/civilizations.client";
import type { CivilizationDoc } from "@/types/firestore";

export function CivilizationsListClient({ civilizations }: { civilizations: CivilizationDoc[] }) {
  return (
    <AdminEntityList
      rows={civilizations.map((c) => ({ slug: c.slug, title: c.title, subtitle: c.tags.join(", ") }))}
      newHref="/admin/civilizations/new"
      newLabel="New Civilization"
      editHrefFor={(slug) => `/admin/civilizations/${slug}/edit`}
      onDelete={(slug) => civilizationsClient.remove(slug)}
      emptyLabel="No civilizations yet."
    />
  );
}
