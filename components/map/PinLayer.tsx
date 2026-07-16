"use client";

import { useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PinMarker } from "./PinMarker";
import { fromUv } from "@/lib/terrain/coords";
import { sampleHeight, type HeightmapData } from "@/lib/terrain/heightSampler";
import { useMapStore } from "@/lib/store/mapStore";
import type { LocationDoc } from "@/types/firestore";

interface PinLayerProps {
  locations: LocationDoc[];
  heightmap: HeightmapData;
  widthUnits: number;
  depthUnits: number;
  maxElevationUnits: number;
  /** Camera zoom at/above which all city pins become visible. */
  minZoomToShow: number;
}

export function PinLayer({
  locations,
  heightmap,
  widthUnits,
  depthUnits,
  maxElevationUnits,
  minZoomToShow,
}: PinLayerProps) {
  const camera = useThree((state) => state.camera);
  const selectedSlug = useMapStore((s) => s.selectedSlug);
  const [allVisible, setAllVisible] = useState(false);

  useFrame(() => {
    const next = camera.zoom >= minZoomToShow;
    if (next !== allVisible) setAllVisible(next);
  });

  // Below the reveal threshold, keep only the selected pin (if any) so a
  // deep link (e.g. "View on Atlas" from a Codex page) still shows its pin.
  const shown = allVisible ? locations : locations.filter((l) => l.slug === selectedSlug);

  return (
    <group>
      {shown.map((location) => {
        const { x, z } = fromUv(location.u, location.v, widthUnits, depthUnits);
        const elevation = sampleHeight(heightmap, location.u, location.v);
        const y = elevation * maxElevationUnits;
        return <PinMarker key={location.slug} location={location} position={[x, y, z]} />;
      })}
    </group>
  );
}
