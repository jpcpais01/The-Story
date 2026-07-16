"use client";

import { motion } from "motion/react";
import { Layers } from "lucide-react";
import { CompassRose } from "./CompassRose";
import { ScaleBar } from "./ScaleBar";
import { useMapStore } from "@/lib/store/mapStore";
import type { WorldDoc } from "@/types/firestore";

const LEGEND_STOPS = [
  { color: "#1f5578", label: "Ocean" },
  { color: "#e4d9ac", label: "Beach" },
  { color: "#d9b872", label: "Desert" },
  { color: "#7ea354", label: "Grassland" },
  { color: "#4c7a3d", label: "Forest" },
  { color: "#8a9a7d", label: "Tundra" },
  { color: "#f8f6f1", label: "Snow" },
];

export function MapHud({ world }: { world: WorldDoc }) {
  const showOverlay = useMapStore((s) => s.showOverlay);
  const toggleOverlay = useMapStore((s) => s.toggleOverlay);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pointer-events-auto absolute left-4 top-[4.5rem] max-w-xs rounded-xl border border-white/10 bg-stone-950/55 p-4 backdrop-blur-md sm:left-6 sm:top-20"
      >
        <p className="font-display text-lg text-parchment-100">{world.name}</p>
        <p className="mt-1 text-xs leading-relaxed text-stone-400">{world.tagline}</p>
      </motion.div>

      {world.overlayUrl && (
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          type="button"
          onClick={toggleOverlay}
          className={`pointer-events-auto absolute right-4 top-[4.5rem] flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition-colors sm:right-6 sm:top-20 ${
            showOverlay
              ? "border-gold-400/50 bg-gold-500/15 text-gold-300"
              : "border-white/15 bg-stone-950/60 text-stone-300 hover:text-stone-100"
          }`}
        >
          <Layers size={14} />
          {showOverlay ? "Charted Map" : "Elevation Tint"}
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
        className="pointer-events-auto absolute bottom-5 left-4 flex flex-col items-start gap-2 sm:left-6 sm:flex-row sm:items-center sm:gap-3"
      >
        <ScaleBar />
        <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-stone-950/55 px-3 py-2 backdrop-blur-md sm:flex">
          {LEGEND_STOPS.map((stop) => (
            <div key={stop.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stop.color }} />
              <span className="text-[11px] text-stone-400">{stop.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        className="pointer-events-auto absolute bottom-5 right-4 sm:right-6"
      >
        <CompassRose />
      </motion.div>
    </div>
  );
}
