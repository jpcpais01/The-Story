"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Globe2, Loader2 } from "lucide-react";
import { createWorld } from "@/lib/firestore/world.client";
import { siteConfig } from "@/config/site.config";
import type { WorldDoc } from "@/types/firestore";

/**
 * Admin-only: turns the selected planet into an explorable world with fresh
 * procedural terrain, then jumps straight into it. The world is editable
 * afterwards from Admin -> World Settings.
 */
export function CreateWorldButton({
  systemId,
  planetName,
}: {
  systemId: string;
  planetName: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const onClick = async () => {
    setBusy(true);
    setError(false);
    const id = `${systemId}-${slugify(planetName, { lower: true, strict: true })}`;
    const world: WorldDoc = {
      id,
      systemId,
      planetName,
      name: planetName,
      tagline: "",
      description: "",
      heightmapUrl: null,
      heightmapPublicId: null,
      heightmapSeed: Math.floor(Math.random() * 2 ** 31),
      terrainDetailWeight: 0.25,
      terrainDetailFrequency: 4.5,
      terrainDetailOctaves: 5,
      terrainDetailLacunarity: 2.05,
      overlayUrl: null,
      overlayPublicId: null,
      mapWidthUnits: siteConfig.mapWidthUnits,
      mapDepthUnits: siteConfig.mapDepthUnits,
      maxElevationUnits: siteConfig.maxElevationUnits,
      seaLevel: siteConfig.defaultSeaLevel,
      updatedAt: Date.now(),
    };
    try {
      await createWorld(world);
      router.push(`/world/${id}`);
    } catch {
      // Most likely: not signed in as admin (Firestore rules reject the write).
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-stone-300 transition-colors hover:border-gold-400/40 hover:text-gold-300 disabled:opacity-50"
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <Globe2 size={12} />}
        Create world
      </button>
      {error && <p className="text-[10px] text-red-300/90">Failed — sign in as admin first.</p>}
    </div>
  );
}
