import type { Metadata } from "next";
import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listEvents } from "@/lib/firestore/events.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { buildSummaries } from "@/lib/codex/buildSummaries";
import { CodexBrowser } from "@/components/codex/CodexBrowser";

export const metadata: Metadata = {
  title: "Codex",
  description: "Civilizations, events, and places of the world.",
};

export default async function CodexPage() {
  const [civilizations, events, locations] = await Promise.all([
    listCivilizations(),
    listEvents(),
    listLocations(),
  ]);
  const entries = buildSummaries(civilizations, events, locations);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6">
      <div className="mb-10">
        <p className="font-display text-sm uppercase tracking-[0.2em] text-gold-400">The Codex</p>
        <h1 className="mt-2 font-display text-3xl text-parchment-100 sm:text-4xl">
          Civilizations, events, and places
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-400">
          Every entry charted on the atlas, gathered in one place. Search, filter, and open any
          entry for its full account.
        </p>
      </div>
      <CodexBrowser entries={entries} />
    </main>
  );
}
