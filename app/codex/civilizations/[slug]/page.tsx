import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCivilization, listCivilizations } from "@/lib/firestore/civilizations.server";
import { getEvent } from "@/lib/firestore/events.server";
import { getLocation } from "@/lib/firestore/locations.server";
import type { RelatedItem } from "@/components/codex/RelatedEntries";
import { DetailBento } from "@/components/codex/DetailBento";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const civ = await getCivilization(slug);
  if (!civ) return {};
  return { title: civ.title, description: civ.summary };
}

export default async function CivilizationPage({ params }: PageProps) {
  const { slug } = await params;
  const civ = await getCivilization(slug);
  if (!civ) notFound();

  const [relatedEvents, relatedLocations] = await Promise.all([
    Promise.all(civ.relatedEventSlugs.map((s) => getEvent(s))),
    Promise.all(civ.relatedLocationSlugs.map((s) => getLocation(s))),
  ]);

  const related: RelatedItem[] = [
    ...relatedEvents
      .filter((e) => e !== null)
      .map((e) => ({ type: "event" as const, slug: e.slug, title: e.title })),
    ...relatedLocations
      .filter((l) => l !== null)
      .map((l) => ({ type: "location" as const, slug: l.slug, title: l.name })),
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6">
      <DetailBento
        eyebrow="Civilization"
        title={civ.title}
        summary={civ.summary}
        coverImage={civ.coverImage}
        tags={civ.tags}
        sections={civ.sections}
        gallery={civ.gallery}
        related={related}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const civs = await listCivilizations();
  return civs.map((c) => ({ slug: c.slug }));
}
