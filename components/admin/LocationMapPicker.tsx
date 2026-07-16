"use client";

import { useEffect } from "react";
import { MapPinPlus } from "lucide-react";
import { MapClientBoundary } from "@/components/map/MapClientBoundary";
import { useMapStore } from "@/lib/store/mapStore";
import type { WorldDoc, LocationDoc } from "@/types/firestore";

interface LocationMapPickerProps {
  world: WorldDoc;
  locations: LocationDoc[];
  value: { u: number; v: number } | null;
  onPick: (uv: { u: number; v: number }) => void;
}

export function LocationMapPicker({ world, locations, value, onPick }: LocationMapPickerProps) {
  const placingPin = useMapStore((s) => s.placingPin);
  const setPlacingPin = useMapStore((s) => s.setPlacingPin);
  const pendingPin = useMapStore((s) => s.pendingPin);

  useEffect(() => {
    if (pendingPin) {
      onPick(pendingPin);
      setPlacingPin(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPin]);

  useEffect(() => () => setPlacingPin(false), [setPlacingPin]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Position on map</p>
        <button
          type="button"
          onClick={() => setPlacingPin(!placingPin)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            placingPin
              ? "bg-gold-500/20 text-gold-300"
              : "border border-white/10 text-stone-300 hover:bg-white/5"
          }`}
        >
          <MapPinPlus size={13} />
          {placingPin ? "Click the map…" : value ? "Move pin" : "Set location"}
        </button>
      </div>
      <div className="relative h-[420px] w-full overflow-hidden rounded-xl border border-white/10">
        <MapClientBoundary world={world} locations={locations} editable highlightUv={value} />
      </div>
      {!value && <p className="mt-2 text-xs text-stone-500">No position set yet.</p>}
    </div>
  );
}
