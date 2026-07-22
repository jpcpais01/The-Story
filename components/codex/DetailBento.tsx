import Link from "next/link";
import { Compass } from "lucide-react";
import type { ImageRef, Section } from "@/types/firestore";
import { CodexImage } from "@/components/codex/CodexImage";
import { RelatedEntries, type RelatedItem } from "@/components/codex/RelatedEntries";

interface DetailBentoProps {
  eyebrow: string;
  title: string;
  summary: string;
  coverImage?: ImageRef | null;
  atlasHref?: string;
  dateLabel?: string;
  tags?: string[];
  description?: string;
  sections: Section[];
  gallery?: ImageRef[];
  related: RelatedItem[];
}

function Tile({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-ink-800/40 p-6 sm:p-7 ${className}`}>{children}</div>
  );
}

export function DetailBento({
  eyebrow,
  title,
  summary,
  coverImage,
  atlasHref,
  dateLabel,
  tags = [],
  description,
  sections,
  gallery = [],
  related,
}: DetailBentoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative col-span-1 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 sm:col-span-2 lg:col-span-4">
        {coverImage && (
          <div className="relative aspect-[16/9] w-full sm:aspect-[3/1]">
            <CodexImage image={coverImage} alt={coverImage.alt || title} sizes="1200px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
          </div>
        )}
        <div className={coverImage ? "absolute inset-x-0 bottom-0 p-6 sm:p-8" : "p-6 sm:p-8"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400 capitalize">
              {eyebrow}
              {dateLabel && <span className="text-stone-400 normal-case tracking-normal"> · {dateLabel}</span>}
            </p>
            {atlasHref && (
              <Link
                href={atlasHref}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-900/60 px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur transition-colors hover:border-gold-400/40 hover:text-gold-300"
              >
                <Compass size={13} />
                View on Atlas
              </Link>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">{title}</h1>
        </div>
      </div>

      <Tile className={tags.length > 0 ? "sm:col-span-2 lg:col-span-3" : "sm:col-span-2 lg:col-span-4"}>
        <p className="text-xs uppercase tracking-wide text-stone-500">Summary</p>
        <p className="mt-2 text-base leading-relaxed text-stone-300">{summary}</p>
      </Tile>

      {tags.length > 0 && (
        <Tile className="lg:col-span-1">
          <p className="text-xs uppercase tracking-wide text-stone-500">Tags</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </Tile>
      )}

      {description && (
        <Tile className="sm:col-span-2 lg:col-span-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">Description</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-300 sm:text-base">
            {description}
          </p>
        </Tile>
      )}

      {sections.map((section) => (
        <Tile key={section.id} className={section.image ? "sm:col-span-2 lg:col-span-4" : "sm:col-span-2 lg:col-span-2"}>
          <h2 className="font-display text-xl text-parchment-100 sm:text-2xl">{section.heading}</h2>
          {section.image && (
            <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-ink-800">
              <CodexImage
                image={section.image}
                alt={section.image.alt || section.heading}
                sizes="(min-width: 1024px) 900px, 90vw"
                className="object-cover"
              />
            </div>
          )}
          <div
            className="prose prose-lore prose-invert mt-4 max-w-none text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
          />
        </Tile>
      ))}

      {gallery.length > 0 && (
        <Tile className="sm:col-span-2 lg:col-span-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-stone-500">Gallery</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((img) => (
              <div key={img.publicId} className="relative aspect-square overflow-hidden rounded-lg bg-ink-800">
                <CodexImage image={img} alt={img.alt || title} sizes="240px" className="object-cover" />
              </div>
            ))}
          </div>
        </Tile>
      )}

      {related.length > 0 && (
        <Tile className="sm:col-span-2 lg:col-span-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-stone-500">Related</p>
          <RelatedEntries items={related} />
        </Tile>
      )}
    </div>
  );
}
