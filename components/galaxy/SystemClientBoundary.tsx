"use client";

import dynamic from "next/dynamic";

const SystemScene = dynamic(() => import("./SystemScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070c12]">
      <div className="flex flex-col items-center gap-3 text-stone-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-500 border-t-amber-300" />
        <p className="font-display text-sm tracking-wide text-stone-400">Resolving the orbits…</p>
      </div>
    </div>
  ),
});

interface SystemClientBoundaryProps {
  systemId: string;
  systemSeed: number;
  systemName: string;
  homeWorldName: string | null;
  planetWorlds: Record<string, { id: string; name: string }>;
  editable: boolean;
}

export function SystemClientBoundary(props: SystemClientBoundaryProps) {
  return (
    <div className="h-full w-full">
      <SystemScene {...props} />
    </div>
  );
}
