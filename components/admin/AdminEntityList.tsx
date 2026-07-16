"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";

export interface AdminEntityRow {
  slug: string;
  title: string;
  subtitle?: string;
}

interface AdminEntityListProps {
  rows: AdminEntityRow[];
  newHref: string;
  newLabel: string;
  editHrefFor: (slug: string) => string;
  onDelete: (slug: string) => Promise<void>;
  emptyLabel: string;
}

export function AdminEntityList({ rows, newHref, newLabel, editHrefFor, onDelete, emptyLabel }: AdminEntityListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeletingSlug(slug);
    startTransition(async () => {
      await onDelete(slug);
      setDeletingSlug(null);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Link
          href={newHref}
          className="flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950 hover:opacity-90"
        >
          <Plus size={15} />
          {newLabel}
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-stone-500">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/5 overflow-hidden rounded-xl border border-white/10">
          {rows.map((row) => (
            <li key={row.slug} className="flex items-center justify-between gap-3 bg-ink-800/40 px-4 py-3">
              <Link href={editHrefFor(row.slug)} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-200">{row.title}</p>
                {row.subtitle && <p className="truncate text-xs text-stone-500">{row.subtitle}</p>}
              </Link>
              <button
                onClick={() => handleDelete(row.slug, row.title)}
                disabled={pending && deletingSlug === row.slug}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-500 hover:bg-red-500/10 hover:text-red-400"
              >
                {pending && deletingSlug === row.slug ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
