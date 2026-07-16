"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { EntryCard } from "./EntryCard";
import type { CodexEntrySummary, CodexEntryType } from "@/types/firestore";

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
} as const;

const FILTERS: { value: CodexEntryType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "civilization", label: "Civilizations" },
  { value: "event", label: "Events" },
  { value: "location", label: "Locations" },
];

export function CodexBrowser({ entries }: { entries: CodexEntrySummary[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CodexEntryType | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (filter !== "all" && entry.type !== filter) return false;
      if (!q) return true;
      const haystack = `${entry.title} ${entry.summary} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query, filter]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the codex…"
            className="w-full rounded-full border border-white/10 bg-ink-800/60 py-2 pl-9 pr-4 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-stone-500">Nothing matches yet. Try another search.</p>
      ) : (
        <motion.div
          key={filter + query}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((entry) => (
            <motion.div key={`${entry.type}-${entry.slug}`} variants={cardVariants}>
              <EntryCard entry={entry} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
