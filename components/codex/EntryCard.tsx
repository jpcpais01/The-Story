import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { Landmark, ScrollText, MapPinned } from "lucide-react";
import type { CodexEntrySummary } from "@/types/firestore";

const TYPE_META = {
  civilization: { route: "civilizations", label: "Civilization", Icon: Landmark },
  event: { route: "events", label: "Event", Icon: ScrollText },
  location: { route: "locations", label: "Location", Icon: MapPinned },
} as const;

export function EntryCard({ entry }: { entry: CodexEntrySummary }) {
  const meta = TYPE_META[entry.type];

  return (
    <Link
      href={`/codex/${meta.route}/${entry.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/60 transition-all duration-200 hover:-translate-y-1 hover:border-gold-400/40 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-700">
        {entry.coverImage ? (
          <CldImage
            src={entry.coverImage.publicId}
            alt={entry.coverImage.alt || entry.title}
            fill
            sizes="(min-width: 1024px) 320px, 45vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900">
            <meta.Icon className="text-stone-600" size={32} strokeWidth={1.25} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-950/90 to-transparent" />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-stone-300 backdrop-blur">
          <meta.Icon size={11} />
          {meta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg leading-snug text-parchment-100 group-hover:text-gold-300">
          {entry.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-stone-400">{entry.summary}</p>
        {entry.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
