"use client";

import dynamic from "next/dynamic";
import type { WorldDoc, LocationDoc } from "@/types/firestore";

const MapScene = dynamic(() => import("./MapScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0b1520]">
      <div className="flex flex-col items-center gap-3 text-stone-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-500 border-t-amber-300" />
        <p className="font-display text-sm tracking-wide text-stone-400">Charting the terrain…</p>
      </div>
    </div>
  ),
});

interface MapClientBoundaryProps {
  world: WorldDoc;
  locations: LocationDoc[];
  editable: boolean;
  initialSelectedSlug?: string | null;
  highlightUv?: { u: number; v: number } | null;
}

export function MapClientBoundary(props: MapClientBoundaryProps) {
  return (
    <div className="h-full w-full">
      <MapScene {...props} />
    </div>
  );
}
