"use client";

import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Landmark, Castle, MapPin, Mountain, Waves } from "lucide-react";
import { useMapStore } from "@/lib/store/mapStore";
import type { LocationDoc } from "@/types/firestore";

const ICONS: Record<LocationDoc["type"], typeof MapPin> = {
  city: Castle,
  ruin: Landmark,
  landmark: Mountain,
  region: Waves,
  other: MapPin,
};

interface PinMarkerProps {
  location: LocationDoc;
  position: [number, number, number];
}

export function PinMarker({ location, position }: PinMarkerProps) {
  const selectedSlug = useMapStore((s) => s.selectedSlug);
  const setSelected = useMapStore((s) => s.setSelected);
  const isSelected = selectedSlug === location.slug;
  const Icon = ICONS[location.type];

  return (
    <Html position={position} center occlude={false} zIndexRange={[10, 0]}>
      {/* relative + only the button in normal flow: the dropdown below is
          absolutely positioned so it can't grow this box and shift where
          drei re-centers the whole overlay on the anchor point. */}
      <div className="pointer-events-none relative flex -translate-y-1/2 flex-col items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelected(isSelected ? null : location.slug);
          }}
          className={`pointer-events-auto group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium shadow-lg backdrop-blur-md transition-all duration-150 ${
            isSelected
              ? "scale-110 border-amber-300/80 bg-amber-400/90 text-stone-900"
              : "border-white/25 bg-stone-900/60 text-stone-100 hover:scale-105 hover:border-amber-300/60 hover:bg-stone-900/80"
          }`}
        >
          <Icon size={13} strokeWidth={2} />
          <span className="whitespace-nowrap font-display tracking-wide">{location.name}</span>
        </button>

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="pointer-events-auto absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 rounded-xl border border-white/15 bg-stone-950/90 p-4 text-left shadow-2xl backdrop-blur-md"
            >
              <p className="font-display text-sm font-semibold text-amber-200">{location.name}</p>
              <p className="mt-1 text-xs capitalize text-stone-400">{location.type}</p>
              <p className="mt-2 text-xs leading-relaxed text-stone-300">{location.summary}</p>
              <Link
                href={`/codex/locations/${location.slug}`}
                className="mt-3 inline-block text-xs font-medium text-amber-300 hover:text-amber-200"
              >
                View full entry →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
}
