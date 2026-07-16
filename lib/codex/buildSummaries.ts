import type { CivilizationDoc, EventDoc, LocationDoc, CodexEntrySummary } from "@/types/firestore";

export function buildSummaries(
  civilizations: CivilizationDoc[],
  events: EventDoc[],
  locations: LocationDoc[]
): CodexEntrySummary[] {
  return [
    ...civilizations.map((c): CodexEntrySummary => ({
      type: "civilization",
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      tags: c.tags,
      coverImage: c.coverImage,
    })),
    ...events.map((e): CodexEntrySummary => ({
      type: "event",
      slug: e.slug,
      title: e.title,
      summary: e.summary,
      tags: e.tags,
      coverImage: e.coverImage,
    })),
    ...locations.map((l): CodexEntrySummary => ({
      type: "location",
      slug: l.slug,
      title: l.name,
      summary: l.summary,
      tags: [l.type],
      coverImage: l.coverImage,
    })),
  ];
}
