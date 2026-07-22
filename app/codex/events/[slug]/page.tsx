import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEvent, listEvents } from "@/lib/firestore/events.server";
import { getCivilization } from "@/lib/firestore/civilizations.server";
import { getLocation } from "@/lib/firestore/locations.server";
import type { RelatedItem } from "@/components/codex/RelatedEntries";
import { DetailBento } from "@/components/codex/DetailBento";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return {};
  return { title: event.title, description: event.summary };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const [relatedCivilizations, relatedLocations] = await Promise.all([
    Promise.all(event.relatedCivilizationSlugs.map((s) => getCivilization(s))),
    Promise.all(event.relatedLocationSlugs.map((s) => getLocation(s))),
  ]);

  const related: RelatedItem[] = [
    ...relatedCivilizations
      .filter((c) => c !== null)
      .map((c) => ({ type: "civilization" as const, slug: c.slug, title: c.title })),
    ...relatedLocations
      .filter((l) => l !== null)
      .map((l) => ({ type: "location" as const, slug: l.slug, title: l.name })),
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <DetailBento
        eyebrow="Event"
        dateLabel={event.dateLabel}
        title={event.title}
        summary={event.summary}
        coverImage={event.coverImage}
        tags={event.tags}
        sections={event.sections}
        gallery={event.gallery}
        related={related}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const events = await listEvents();
  return events.map((e) => ({ slug: e.slug }));
}
