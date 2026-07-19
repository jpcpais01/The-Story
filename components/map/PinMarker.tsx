"use client";

import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Landmark, Castle, MapPin, Mountain, Waves } from "lucide-react";
import { useMapStore } from "@/lib/store/mapStore";
import { CodexImage } from "@/components/codex/CodexImage";
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

// Radial fade used so regions read as a soft area of influence instead of a
// hard-edged badge -- the mask, not just opacity, is what vanishes the edges.
const REGION_FADE_MASK =
  "radial-gradient(ellipse 65% 60% at center, black 30%, transparent 88%)";

export function PinMarker({ location, position }: PinMarkerProps) {
  const selectedSlug = useMapStore((s) => s.selectedSlug);
  const setSelected = useMapStore((s) => s.setSelected);
  const isSelected = selectedSlug === location.slug;
  const Icon = ICONS[location.type];
  const isRegion = location.type === "region";

  return (
    <Html position={position} center occlude={false} zIndexRange={isRegion ? [5, 0] : [10, 0]}>
      {/* relative + only the button in normal flow: the dropdown below is
          absolutely positioned so it can't grow this box and shift where
          drei re-centers the whole overlay on the anchor point. */}
      <div className="pointer-events-none relative flex -translate-y-1/2 flex-col items-center">
        {isRegion ? (
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelected(isSelected ? null : location.slug);
            }}
            animate={{ opacity: isSelected ? 1 : [0.5, 0.85, 0.5] }}
            transition={
              isSelected ? { duration: 0.2 } : { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }
            className="pointer-events-auto group relative flex items-center gap-2 px-7 py-4"
          >
            <span
              aria-hidden
              className="absolute inset-0 -z-10 bg-sky-400/10 blur-xl"
              style={{ maskImage: REGION_FADE_MASK, WebkitMaskImage: REGION_FADE_MASK }}
            />
            <Icon
              size={15}
              strokeWidth={1.5}
              className={isSelected ? "text-sky-100" : "text-sky-200/80"}
              style={{ filter: "drop-shadow(0 0 6px rgba(125, 211, 252, 0.65))" }}
            />
            <span
              className={`whitespace-nowrap font-display text-xs font-medium uppercase tracking-[0.25em] ${
                isSelected ? "text-sky-100" : "text-sky-200/80"
              }`}
              style={{ textShadow: "0 0 12px rgba(125, 211, 252, 0.6)" }}
            >
              {location.name}
            </span>
          </motion.button>
        ) : (
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
        )}

        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="pointer-events-auto absolute left-1/2 top-full z-10 mt-2 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-white/15 bg-stone-950/90 text-left shadow-2xl backdrop-blur-md"
            >
              {location.coverImage && (
                <div className="relative h-20 w-full">
                  <CodexImage
                    image={location.coverImage}
                    alt={location.coverImage.alt || location.name}
                    sizes="256px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-display text-sm font-semibold text-amber-200">{location.name}</p>
                  <p className="shrink-0 text-[10px] capitalize text-stone-400">{location.type}</p>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-stone-300">{location.summary}</p>
                <Link
                  href={`/codex/locations/${location.slug}`}
                  className="mt-2 inline-block text-xs font-medium text-amber-300 hover:text-amber-200"
                >
                  View full entry →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Html>
  );
}
