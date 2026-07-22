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
    <div
      className={`rounded-2xl border border-white/10 bg-ink-800/40 p-6 transition-colors duration-300 hover:border-white/20 sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * A lone odd section out gets the full row to itself; every other section
 * is half-width. An even count of half-width tiles always pairs up cleanly,
 * so every row sums to exactly 4/4 columns for any number of sections --
 * no gaps, no reordering, no dependence on content length.
 */
function isFeatured(index: number, total: number) {
  return total % 2 === 1 && index === 0;
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
      <div className="col-span-1 overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition-colors duration-300 hover:border-white/20 sm:col-span-2 lg:col-span-4">
        {coverImage && (
          <div className="relative aspect-[16/9] w-full lg:aspect-[21/9]">
            <CodexImage image={coverImage} alt={coverImage.alt || title} sizes="1200px" className="object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400 capitalize">
              {eyebrow}
              {dateLabel && <span className="text-stone-400 normal-case tracking-normal"> · {dateLabel}</span>}
            </p>
            {atlasHref && (
              <Link
                href={atlasHref}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:border-gold-400/40 hover:text-gold-300"
              >
                <Compass size={13} />
                View on Atlas
              </Link>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-300">{summary}</p>
          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-stone-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {description && (
        <Tile className="border-l-2 border-l-gold-500/40 sm:col-span-2 lg:col-span-4">
          <p className="text-xs uppercase tracking-wide text-stone-500">Description</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-300 sm:text-base">
            {description}
          </p>
        </Tile>
      )}

      {sections.map((section, index) => {
        const featured = isFeatured(index, sections.length);
        return (
          <Tile key={section.id} className={featured ? "sm:col-span-2 lg:col-span-4" : "sm:col-span-1 lg:col-span-2"}>
            <p className="font-display text-xs tracking-[0.3em] text-gold-500/60">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-1 font-display text-xl text-parchment-100 sm:text-2xl">{section.heading}</h2>
            {section.image && (
              <div
                className={`relative mt-4 w-full overflow-hidden rounded-xl bg-ink-800 ${featured ? "aspect-[21/9]" : "aspect-[16/9]"}`}
              >
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
        );
      })}

      {gallery.length > 0 && (
        <>
          <div className="col-span-1 flex items-center gap-3 pt-2 sm:col-span-2 lg:col-span-4">
            <p className="text-xs uppercase tracking-wide text-stone-500">Gallery</p>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          {gallery.map((img) => (
            <div
              key={img.publicId}
              className="relative col-span-1 aspect-square overflow-hidden rounded-2xl border border-white/10 bg-ink-800 transition-colors duration-300 hover:border-white/20"
            >
              <CodexImage image={img} alt={img.alt || title} sizes="(min-width: 1024px) 300px, 45vw" className="object-cover" />
            </div>
          ))}
        </>
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
