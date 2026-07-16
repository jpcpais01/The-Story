"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMapStore } from "@/lib/store/mapStore";

export function HudTracker() {
  const { camera, size } = useThree();
  const setHudMetrics = useMapStore((s) => s.setHudMetrics);
  const last = useRef(0);

  useFrame(() => {
    // Orthographic: visible world height = (top - bottom) / zoom, independent of distance.
    const unitsPerPixel =
      camera instanceof THREE.OrthographicCamera && size.height > 0
        ? (camera.top - camera.bottom) / camera.zoom / size.height
        : 0;

    if (Math.abs(unitsPerPixel - last.current) > 0.0005) {
      last.current = unitsPerPixel;
      setHudMetrics({ unitsPerPixel });
    }
  });

  return null;
}
