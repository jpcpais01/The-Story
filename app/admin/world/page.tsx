import Link from "next/link";
import { Globe2, Sparkles } from "lucide-react";
import { listWorlds } from "@/lib/firestore/world.server";
import { WorldSettingsForm } from "@/components/admin/WorldSettingsForm";
import { DeleteWorldButton } from "@/components/admin/DeleteWorldButton";

interface PageProps {
  searchParams: Promise<{ world?: string }>;
}

export default async function AdminWorldPage({ searchParams }: PageProps) {
  const [{ world: requestedId }, worlds] = await Promise.all([searchParams, listWorlds()]);
  const selected = worlds.find((w) => w.id === (requestedId ?? "main")) ?? worlds[0];

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">World Settings</h1>
      <p className="mt-1 mb-5 text-sm text-stone-400">
        Every explorable world: the original Atlas plus any created from planets in the galaxy.
        New worlds are created from a planet&apos;s card in its star system view.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {worlds.map((w) => {
          const active = w.id === selected.id;
          return (
            <Link
              key={w.id}
              href={w.id === "main" ? "/admin/world" : `/admin/world?world=${w.id}`}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-gold-400/50 bg-gold-500/15 text-gold-300"
                  : "border-white/10 text-stone-300 hover:border-gold-400/30 hover:text-gold-300"
              }`}
            >
              {w.id === "main" ? <Sparkles size={12} /> : <Globe2 size={12} />}
              {w.name || w.id}
            </Link>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-800/40 px-4 py-3">
        <div className="text-xs text-stone-400">
          {selected.id === "main" ? (
            <>The original Atlas world — shown on the homepage.</>
          ) : (
            <>
              World of planet <span className="text-stone-200">{selected.planetName}</span>
              {selected.systemId && (
                <>
                  {" · "}
                  <Link href={`/galaxy/${selected.systemId}`} className="text-gold-300 hover:text-gold-200">
                    view star system
                  </Link>
                </>
              )}
              {" · "}
              <Link href={`/world/${selected.id}`} className="text-gold-300 hover:text-gold-200">
                open world
              </Link>
            </>
          )}
        </div>
        {selected.id !== "main" && <DeleteWorldButton worldId={selected.id} worldName={selected.name} />}
      </div>

      <WorldSettingsForm key={selected.id} world={selected} />
    </div>
  );
}
