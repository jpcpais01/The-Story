import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CldImage } from "next-cloudinary";
import { getEvent, listEvents } from "@/lib/firestore/events.server";
import { getCivilization } from "@/lib/firestore/civilizations.server";
import { getLocation } from "@/lib/firestore/locations.server";
import { SectionRenderer } from "@/components/codex/SectionRenderer";
import { RelatedEntries, type RelatedItem } from "@/components/codex/RelatedEntries";

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
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      {event.coverImage && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-800">
          <CldImage
            src={event.coverImage.publicId}
            alt={event.coverImage.alt || event.title}
            fill
            sizes="720px"
            className="object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400">Event</p>
        <span className="text-sm text-stone-500">·</span>
        <p className="text-sm text-stone-400">{event.dateLabel}</p>
      </div>
      <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">{event.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-stone-300">{event.summary}</p>

      {event.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-white/10 pt-10">
        <SectionRenderer sections={event.sections} />
      </div>

      {event.gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.gallery.map((img) => (
            <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
              <CldImage src={img.publicId} alt={img.alt || event.title} fill sizes="240px" className="object-cover" />
            </div>
          ))}
        </div>
      )}

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
  const events = await listEvents();
  return events.map((e) => ({ slug: e.slug }));
}
