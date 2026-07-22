import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGalaxy } from "@/lib/firestore/galaxy.server";
import { getWorld, listWorlds } from "@/lib/firestore/world.server";
import { generateSystems, getSystemSeed } from "@/lib/galaxy/generator";
import { SystemClientBoundary } from "@/components/galaxy/SystemClientBoundary";
import { RegenerateSystemButton } from "@/components/galaxy/RegenerateSystemButton";
import { EDITABLE, siteConfig } from "@/config/site.config";

interface PageProps {
  params: Promise<{ systemId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { systemId } = await params;
  const galaxy = await getGalaxy();
  const system = generateSystems(galaxy.galaxySeed).find((s) => s.id === systemId);
  if (!system) return {};
  return { title: system.name, description: `The ${system.name} star system.` };
}

export default async function SystemPage({ params }: PageProps) {
  const [{ systemId }, galaxy, world, worlds] = await Promise.all([
    params,
    getGalaxy(),
    getWorld(),
    listWorlds(),
  ]);

  const system = generateSystems(galaxy.galaxySeed).find((s) => s.id === systemId);
  if (!system) notFound();

  const isHome = systemId === galaxy.homeSystemId;
  const systemSeed = getSystemSeed(galaxy, systemId);

  const planetWorlds: Record<string, { id: string; name: string }> = {};
  for (const w of worlds) {
    if (w.systemId === systemId && w.planetName) {
      planetWorlds[w.planetName] = { id: w.id, name: w.name };
    }
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#070c12]">
      <SystemClientBoundary
        systemId={systemId}
        systemSeed={systemSeed}
        systemName={system.name}
        homeWorldName={isHome ? world.name || siteConfig.worldNameFallback : null}
        planetWorlds={planetWorlds}
        editable={EDITABLE}
      />

      <div className="pointer-events-none absolute inset-x-0 top-20 flex flex-col items-center gap-1">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold-500/70">
          {isHome ? "Home system" : "Star system"}
        </p>
        <h1 className="font-display text-2xl text-parchment-100 sm:text-3xl">{system.name}</h1>
      </div>

      <div className="pointer-events-none absolute left-4 top-20 sm:left-6">
        <Link
          href="/galaxy"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/60 px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur transition-colors hover:border-gold-400/40 hover:text-gold-300"
        >
          <ArrowLeft size={13} />
          Galaxy
        </Link>
      </div>

      {EDITABLE && (
        <div className="pointer-events-none absolute right-4 top-20 sm:right-6">
          <RegenerateSystemButton systemId={systemId} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <p className="rounded-full border border-white/10 bg-ink-950/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-400 backdrop-blur">
          Drag to orbit · Tap a planet
        </p>
      </div>
    </main>
  );
}
