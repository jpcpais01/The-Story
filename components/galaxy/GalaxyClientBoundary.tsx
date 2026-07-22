"use client";

import dynamic from "next/dynamic";

const GalaxyScene = dynamic(() => import("./GalaxyScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070c12]">
      <div className="flex flex-col items-center gap-3 text-stone-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-500 border-t-amber-300" />
        <p className="font-display text-sm tracking-wide text-stone-400">Charting the firmament…</p>
      </div>
    </div>
  ),
});

interface GalaxyClientBoundaryProps {
  galaxySeed: number;
  homeSystemId: string;
  worldName: string;
}

export function GalaxyClientBoundary(props: GalaxyClientBoundaryProps) {
  return (
    <div className="h-full w-full">
      <GalaxyScene {...props} />
    </div>
  );
}
