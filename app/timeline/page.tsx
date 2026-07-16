import type { Metadata } from "next";
import Link from "next/link";
import { listEvents } from "@/lib/firestore/events.server";

export const metadata: Metadata = {
  title: "Timeline",
  description: "Every recorded event, in order.",
};

export default async function TimelinePage() {
  const events = await listEvents();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <div className="mb-12">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400">The Timeline</p>
        <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">
          The events of the world, in order
        </h1>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-stone-500">No events recorded yet.</p>
      ) : (
        <ol className="relative border-l border-white/10 pl-8">
          {events.map((event) => (
            <li key={event.slug} className="mb-10 last:mb-0">
              <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-gold-400" />
              <Link href={`/codex/events/${event.slug}`} className="group block">
                <p className="text-xs uppercase tracking-wide text-stone-500">{event.dateLabel}</p>
                <h2 className="mt-1 font-display text-xl text-parchment-100 group-hover:text-gold-300">
                  {event.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{event.summary}</p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
