import type { Metadata } from "next";
import { getGalaxy } from "@/lib/firestore/galaxy.server";
import { getWorld } from "@/lib/firestore/world.server";
import { GalaxyClientBoundary } from "@/components/galaxy/GalaxyClientBoundary";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Galaxy",
  description: "The star systems of the firmament, charted.",
};

export default async function GalaxyPage() {
  const [galaxy, world] = await Promise.all([getGalaxy(), getWorld()]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#070c12]">
      <GalaxyClientBoundary
        galaxySeed={galaxy.galaxySeed}
        homeSystemId={galaxy.homeSystemId}
        worldName={world.name || siteConfig.worldNameFallback}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <p className="rounded-full border border-white/10 bg-ink-950/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-stone-400 backdrop-blur">
          Select a star system · The gold beacon is home
        </p>
      </div>
    </main>
  );
}
