"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useMapStore } from "@/lib/store/mapStore";

interface HudTrackerProps {
  controlsRef: React.RefObject<MapControlsImpl | null>;
}

export function HudTracker({ controlsRef }: HudTrackerProps) {
  const { camera, size } = useThree();
  const setHudMetrics = useMapStore((s) => s.setHudMetrics);
  const resetHeadingRequestId = useMapStore((s) => s.resetHeadingRequestId);
  const last = useRef({ heading: 0, unitsPerPixel: 0 });

  useEffect(() => {
    if (resetHeadingRequestId === 0) return;
    controlsRef.current?.setAzimuthalAngle(0);
  }, [resetHeadingRequestId, controlsRef]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const headingRad = controls.getAzimuthalAngle();
    const headingDeg = (-headingRad * 180) / Math.PI;

    // Orthographic: visible world height = (top - bottom) / zoom, independent of distance.
    const unitsPerPixel =
      camera instanceof THREE.OrthographicCamera && size.height > 0
        ? (camera.top - camera.bottom) / camera.zoom / size.height
        : 0;

    if (
      Math.abs(headingDeg - last.current.heading) > 0.15 ||
      Math.abs(unitsPerPixel - last.current.unitsPerPixel) > 0.0005
    ) {
      last.current = { heading: headingDeg, unitsPerPixel };
      setHudMetrics({ compassHeading: headingDeg, unitsPerPixel });
    }
  });

  return null;
}
