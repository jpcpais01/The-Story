import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocation, listLocations } from "@/lib/firestore/locations.server";
import { getCivilization } from "@/lib/firestore/civilizations.server";
import { getEvent } from "@/lib/firestore/events.server";
import type { RelatedItem } from "@/components/codex/RelatedEntries";
import { DetailBento } from "@/components/codex/DetailBento";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) return {};
  return { title: location.name, description: location.summary };
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const location = await getLocation(slug);
  if (!location) notFound();

  const [relatedCivilizations, relatedEvents] = await Promise.all([
    Promise.all(location.relatedCivilizationSlugs.map((s) => getCivilization(s))),
    Promise.all(location.relatedEventSlugs.map((s) => getEvent(s))),
  ]);

  const related: RelatedItem[] = [
    ...relatedCivilizations
      .filter((c) => c !== null)
      .map((c) => ({ type: "civilization" as const, slug: c.slug, title: c.title })),
    ...relatedEvents
      .filter((e) => e !== null)
      .map((e) => ({ type: "event" as const, slug: e.slug, title: e.title })),
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <DetailBento
        eyebrow={location.type}
        title={location.name}
        summary={location.summary}
        coverImage={location.coverImage}
        atlasHref={`/?focus=${location.slug}`}
        description={location.description}
        sections={location.sections}
        related={related}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const locations = await listLocations();
  return locations.map((l) => ({ slug: l.slug }));
}
