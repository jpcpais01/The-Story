"use client";

import { useEffect, useMemo, useState } from "react";
import { generateProceduralHeightmap, type TerrainDetailParams } from "@/lib/terrain/proceduralHeightmap";
import { loadHeightmapFromUrl } from "@/lib/terrain/loadHeightmapFromImage";
import { generateClimate } from "@/lib/terrain/climateGenerator";
import type { HeightmapData } from "@/lib/terrain/heightSampler";

export interface TerrainData {
  elevation: HeightmapData;
  temperature: HeightmapData;
  humidity: HeightmapData;
}

const GRID_HEIGHT = 256;

/**
 * Resolves the active elevation map (the admin-uploaded image if present,
 * otherwise a deterministic procedural placeholder from `seed`) and derives
 * a temperature/humidity field from it -- works the same way regardless of
 * where the elevation came from. `aspectRatio` should be mapWidthUnits /
 * mapDepthUnits, so the generated grid isn't stretched when displayed.
 * Returns null only while a real uploaded heightmap is being rasterized.
 */
export function useTerrainData(
  heightmapUrl: string | null,
  seed: number,
  seaLevel: number,
  aspectRatio: number,
  detail: TerrainDetailParams
): TerrainData | null {
  const gridWidth = Math.max(2, Math.round(GRID_HEIGHT * aspectRatio));

  const procedural = useMemo(
    () => generateProceduralHeightmap(gridWidth, GRID_HEIGHT, seed, detail),
    [gridWidth, seed, detail]
  );
  const [uploaded, setUploaded] = useState<HeightmapData | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Nothing to fetch -- `elevation` below already falls back to `procedural`
    // whenever heightmapUrl is null, so stale `uploaded`/`loadedUrl` state is
    // harmless (the `loadedUrl === heightmapUrl` check guards it).
    if (!heightmapUrl) return;
    let cancelled = false;
    loadHeightmapFromUrl(heightmapUrl, gridWidth, GRID_HEIGHT).then((data) => {
      if (!cancelled) {
        setUploaded(data);
        setLoadedUrl(heightmapUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [heightmapUrl, gridWidth]);

  const elevation = !heightmapUrl ? procedural : uploaded && loadedUrl === heightmapUrl ? uploaded : null;

  const climate = useMemo(
    () => (elevation ? generateClimate(elevation, seaLevel, seed) : null),
    [elevation, seaLevel, seed]
  );

  if (!elevation || !climate) return null;
  return { elevation, temperature: climate.temperature, humidity: climate.humidity };
}
