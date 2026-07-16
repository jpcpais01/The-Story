"use client";

import { useState } from "react";
import { Dices, Save, Download, Loader2 } from "lucide-react";
import { MapClientBoundary } from "@/components/map/MapClientBoundary";
import { saveWorld } from "@/lib/firestore/world.client";
import { downloadHeightmapImage } from "@/lib/terrain/downloadHeightmapImage";
import type { WorldDoc } from "@/types/firestore";

interface ProceduralHeightmapPanelProps {
  world: WorldDoc;
  seed: number;
  onSeedChange: (seed: number) => void;
}

export function ProceduralHeightmapPanel({ world, seed, onSeedChange }: ProceduralHeightmapPanelProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const previewWorld: WorldDoc = { ...world, heightmapUrl: null, heightmapSeed: seed, overlayUrl: null };

  function handleReroll() {
    onSeedChange(Math.floor(Math.random() * 1_000_000));
    setSaved(false);
  }

  async function handleSaveSeed() {
    setSaving(true);
    await saveWorld({ heightmapSeed: seed });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Procedural heightmap (used while no heightmap image is uploaded above)
        </p>
        <span className="text-xs text-stone-500">Seed: {seed}</span>
      </div>

      <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-white/10">
        <MapClientBoundary world={previewWorld} locations={[]} editable={false} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleReroll}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-stone-200 hover:bg-white/5"
        >
          <Dices size={14} />
          Re-roll
        </button>
        <button
          type="button"
          onClick={handleSaveSeed}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-medium text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save this seed
        </button>
        <button
          type="button"
          onClick={() => downloadHeightmapImage(seed, world.name, world.mapWidthUnits / world.mapDepthUnits)}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-stone-200 hover:bg-white/5"
        >
          <Download size={14} />
          Download grayscale image
        </button>
        {saved && <span className="text-xs text-gold-300">Seed saved to the live map.</span>}
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Re-roll to explore options, then either save the seed to keep this terrain live, or download
        the grayscale image to paint your hand-drawn map on top of before uploading it above.
      </p>
    </div>
  );
}
