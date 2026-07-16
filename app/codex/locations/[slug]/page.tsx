import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { getLocation, listLocations } from "@/lib/firestore/locations.server";
import { getCivilization } from "@/lib/firestore/civilizations.server";
import { getEvent } from "@/lib/firestore/events.server";
import { RelatedEntries, type RelatedItem } from "@/components/codex/RelatedEntries";
import { CodexImage } from "@/components/codex/CodexImage";

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
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      {location.coverImage && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-800">
          <CodexImage
            image={location.coverImage}
            alt={location.coverImage.alt || location.name}
            sizes="720px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400 capitalize">
          {location.type}
        </p>
        <Link
          href={`/?focus=${location.slug}`}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:border-gold-400/40 hover:text-gold-300"
        >
          <Compass size={13} />
          View on Atlas
        </Link>
      </div>
      <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">{location.name}</h1>
      <p className="mt-4 text-base leading-relaxed text-stone-300">{location.summary}</p>

      <div className="mt-10 border-t border-white/10 pt-10">
        <p className="whitespace-pre-line text-sm leading-relaxed text-stone-300 sm:text-base">
          {location.description}
        </p>
      </div>

      {related.length > 0 && (
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="mb-3 text-xs uppercase tracking-wide text-stone-500">Related</p>
          <RelatedEntries items={related} />
        </div>
      )}
    </main>
  );
}

export async function generateStaticParams() {
  const locations = await listLocations();
  return locations.map((l) => ({ slug: l.slug }));
}
