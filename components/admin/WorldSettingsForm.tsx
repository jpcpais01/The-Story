"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Loader2 } from "lucide-react";
import { worldSchema, type WorldFormValues } from "@/lib/validation/world.schema";
import { saveWorld } from "@/lib/firestore/world.client";
import { ImageUploadField } from "./ImageUploadField";
import { ProceduralHeightmapPanel } from "./ProceduralHeightmapPanel";
import type { TerrainDetailParams } from "@/lib/terrain/proceduralHeightmap";
import type { WorldDoc, ImageRef } from "@/types/firestore";

export function WorldSettingsForm({ world }: { world: WorldDoc }) {
  const [heightmap, setHeightmap] = useState<ImageRef | null>(
    world.heightmapUrl ? { url: world.heightmapUrl, publicId: world.heightmapPublicId ?? "", width: 0, height: 0 } : null
  );
  const [overlay, setOverlay] = useState<ImageRef | null>(
    world.overlayUrl ? { url: world.overlayUrl, publicId: world.overlayPublicId ?? "", width: 0, height: 0 } : null
  );
  const [seed, setSeed] = useState(world.heightmapSeed);
  const [detail, setDetail] = useState<TerrainDetailParams>({
    detailWeight: world.terrainDetailWeight,
    detailFrequency: world.terrainDetailFrequency,
    detailOctaves: world.terrainDetailOctaves,
    detailLacunarity: world.terrainDetailLacunarity,
  });
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorldFormValues>({
    resolver: zodResolver(worldSchema),
    defaultValues: {
      name: world.name,
      tagline: world.tagline,
      description: world.description,
      mapWidthUnits: world.mapWidthUnits,
      mapDepthUnits: world.mapDepthUnits,
      maxElevationUnits: world.maxElevationUnits,
      seaLevel: world.seaLevel,
    },
  });

  async function onSubmit(values: WorldFormValues) {
    setSaved(false);
    await saveWorld(
      {
        ...values,
        heightmapUrl: heightmap?.url ?? null,
        heightmapPublicId: heightmap?.publicId ?? null,
        heightmapSeed: seed,
        terrainDetailWeight: detail.detailWeight,
        terrainDetailFrequency: detail.detailFrequency,
        terrainDetailOctaves: detail.detailOctaves,
        terrainDetailLacunarity: detail.detailLacunarity,
        overlayUrl: overlay?.url ?? null,
        overlayPublicId: overlay?.publicId ?? null,
      },
      world.id
    );
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <ImageUploadField value={heightmap} onChange={setHeightmap} label="Heightmap (grayscale, white = high)" />
        <ImageUploadField value={overlay} onChange={setOverlay} label="Hand-drawn map overlay" />
      </div>

      <ProceduralHeightmapPanel
        world={world}
        seed={seed}
        onSeedChange={setSeed}
        detail={detail}
        onDetailChange={setDetail}
      />

      <Field label="World name" error={errors.name?.message}>
        <input {...register("name")} className={inputClass} />
      </Field>
      <Field label="Tagline" error={errors.tagline?.message}>
        <input {...register("tagline")} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea {...register("description")} rows={3} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Map width (units)" error={errors.mapWidthUnits?.message}>
          <input type="number" step="any" {...register("mapWidthUnits", { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Map depth (units)" error={errors.mapDepthUnits?.message}>
          <input type="number" step="any" {...register("mapDepthUnits", { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Max elevation (units)" error={errors.maxElevationUnits?.message}>
          <input type="number" step="any" {...register("maxElevationUnits", { valueAsNumber: true })} className={inputClass} />
        </Field>
        <Field label="Sea level (0–1)" error={errors.seaLevel?.message}>
          <input type="number" step="0.01" {...register("seaLevel", { valueAsNumber: true })} className={inputClass} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save world settings
        </button>
        {saved && <span className="text-xs text-gold-300">Saved.</span>}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
