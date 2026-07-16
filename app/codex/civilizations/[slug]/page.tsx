import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCivilization, listCivilizations } from "@/lib/firestore/civilizations.server";
import { getEvent } from "@/lib/firestore/events.server";
import { getLocation } from "@/lib/firestore/locations.server";
import { SectionRenderer } from "@/components/codex/SectionRenderer";
import { RelatedEntries, type RelatedItem } from "@/components/codex/RelatedEntries";
import { CodexImage } from "@/components/codex/CodexImage";

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
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      {civ.coverImage && (
        <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ink-800">
          <CodexImage
            image={civ.coverImage}
            alt={civ.coverImage.alt || civ.title}
            sizes="720px"
            className="object-cover"
          />
        </div>
      )}

      <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400">Civilization</p>
      <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">{civ.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-stone-300">{civ.summary}</p>

      {civ.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {civ.tags.map((tag) => (
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
        <SectionRenderer sections={civ.sections} />
      </div>

      {civ.gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {civ.gallery.map((img) => (
            <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
              <CodexImage image={img} alt={img.alt || civ.title} sizes="240px" className="object-cover" />
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
  const civs = await listCivilizations();
  return civs.map((c) => ({ slug: c.slug }));
}
