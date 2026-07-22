"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ShieldCheck } from "lucide-react";
import { EDITABLE } from "@/config/site.config";

const NAV_LINKS = [
  { href: "/", label: "Atlas" },
  { href: "/galaxy", label: "Galaxy" },
  { href: "/codex", label: "Codex" },
  { href: "/timeline", label: "Timeline" },
];

export function SiteHeader({ worldName }: { worldName: string }) {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-950/55 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 text-stone-100">
          <Compass size={18} className="shrink-0 text-gold-400" strokeWidth={1.75} />
          <span className="truncate font-display text-base tracking-wide max-w-[7rem] sm:max-w-none">
            {worldName}
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {NAV_LINKS.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
                  active
                    ? "bg-gold-500/15 text-gold-300"
                    : "text-stone-300 hover:bg-white/5 hover:text-stone-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {EDITABLE && (
            <Link
              href="/admin"
              aria-label="Admin"
              className={`ml-1 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
                pathname.startsWith("/admin")
                  ? "bg-gold-500/15 text-gold-300"
                  : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
              }`}
            >
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
