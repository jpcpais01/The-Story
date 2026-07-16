"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MapControls as MapControlsImpl } from "three-stdlib";
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

    const distance = camera.position.distanceTo(controls.target);
    const fovRad = (("fov" in camera ? camera.fov : 42) * Math.PI) / 180;
    const visibleHeight = 2 * distance * Math.tan(fovRad / 2);
    const unitsPerPixel = size.height > 0 ? visibleHeight / size.height : 0;

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
