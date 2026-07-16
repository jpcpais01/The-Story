"use client";

import { PinMarker } from "./PinMarker";
import { fromUv } from "@/lib/terrain/coords";
import { sampleHeight, type HeightmapData } from "@/lib/terrain/heightSampler";
import type { LocationDoc } from "@/types/firestore";

interface PinLayerProps {
  locations: LocationDoc[];
  heightmap: HeightmapData;
  widthUnits: number;
  depthUnits: number;
  maxElevationUnits: number;
}

export function PinLayer({ locations, heightmap, widthUnits, depthUnits, maxElevationUnits }: PinLayerProps) {
  return (
    <group>
      {locations.map((location) => {
        const { x, z } = fromUv(location.u, location.v, widthUnits, depthUnits);
        const elevation = sampleHeight(heightmap, location.u, location.v);
        const y = elevation * maxElevationUnits;
        return <PinMarker key={location.slug} location={location} position={[x, y, z]} />;
      })}
    </group>
  );
}
