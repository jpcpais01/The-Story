"use client";

import { useMapStore } from "@/lib/store/mapStore";

const NICE_STEPS = [1, 2, 5];

function niceValue(rough: number): number {
  if (rough <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  const step = NICE_STEPS.find((s) => s >= residual) ?? 10;
  return step * magnitude;
}

export function ScaleBar() {
  const unitsPerPixel = useMapStore((s) => s.unitsPerPixel);
  if (!unitsPerPixel) return null;

  const targetPixelWidth = 120;
  const roughUnits = unitsPerPixel * targetPixelWidth;
  const value = niceValue(roughUnits);
  const pixelWidth = value / unitsPerPixel;

  return (
    <div className="flex flex-col items-start gap-1 rounded-lg border border-white/10 bg-stone-950/55 px-3 py-2 backdrop-blur-md">
      <div className="relative h-2" style={{ width: pixelWidth }}>
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-stone-300/70" />
        <div className="absolute left-0 top-0 h-2 w-px bg-stone-300/70" />
        <div className="absolute right-0 top-0 h-2 w-px bg-stone-300/70" />
      </div>
      <span className="font-display text-[11px] tracking-wide text-stone-300">
        {value.toLocaleString()} leagues
      </span>
    </div>
  );
}
