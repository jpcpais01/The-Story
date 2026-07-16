"use client";

import { useEffect, useMemo, useState } from "react";
import { generateProceduralHeightmap } from "@/lib/terrain/proceduralHeightmap";
import { loadHeightmapFromUrl } from "@/lib/terrain/loadHeightmapFromImage";
import type { HeightmapData } from "@/lib/terrain/heightSampler";

/**
 * Resolves the active heightmap: the admin-uploaded one if present, otherwise
 * a deterministic procedural placeholder. Returns null only while a real
 * uploaded heightmap is being fetched/rasterized.
 */
export function useHeightmap(heightmapUrl: string | null): HeightmapData | null {
  const procedural = useMemo(() => generateProceduralHeightmap(256), []);
  const [uploaded, setUploaded] = useState<HeightmapData | null>(null);
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  useEffect(() => {
    // Nothing to fetch -- the render below already falls back to `procedural`
    // whenever heightmapUrl is null, so stale `uploaded`/`loadedUrl` state is
    // harmless (the `loadedUrl === heightmapUrl` check guards it) and doesn't
    // need to be reset here.
    if (!heightmapUrl) return;
    let cancelled = false;
    loadHeightmapFromUrl(heightmapUrl).then((data) => {
      if (!cancelled) {
        setUploaded(data);
        setLoadedUrl(heightmapUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [heightmapUrl]);

  if (!heightmapUrl) return procedural;
  if (uploaded && loadedUrl === heightmapUrl) return uploaded;
  return null;
}
