import Link from "next/link";
import { Landmark, ScrollText, MapPinned } from "lucide-react";
import type { CodexEntryType } from "@/types/firestore";

const TYPE_META = {
  civilization: { route: "civilizations", Icon: Landmark },
  event: { route: "events", Icon: ScrollText },
  location: { route: "locations", Icon: MapPinned },
} as const;

export interface RelatedItem {
  type: CodexEntryType;
  slug: string;
  title: string;
}

export function RelatedEntries({ items }: { items: RelatedItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        return (
          <Link
            key={`${item.type}-${item.slug}`}
            href={`/codex/${meta.route}/${item.slug}`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-800/60 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:border-gold-400/40 hover:text-gold-300"
          >
            <meta.Icon size={12} />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
