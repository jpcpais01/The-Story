"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";

interface PanBoundsControllerProps {
  controlsRef: React.RefObject<MapControlsImpl | null>;
  widthUnits: number;
  depthUnits: number;
}

// How far past the map's own edge panning is still allowed -- enough to
// comfortably see the border, not an open-ended pan.
const PAN_OVERSHOOT_FACTOR = 1.15;

/**
 * Clamps the MapControls target to stay within a margin around the map
 * bounds, instead of letting panning drift indefinitely. `controls.update()`
 * re-derives the camera position from the (possibly tilted) spherical offset
 * around the clamped target, so this stays correct through the zoom tilt too.
 */
export function PanBoundsController({ controlsRef, widthUnits, depthUnits }: PanBoundsControllerProps) {
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const maxX = (widthUnits / 2) * PAN_OVERSHOOT_FACTOR;
    const maxZ = (depthUnits / 2) * PAN_OVERSHOOT_FACTOR;
    const target = controls.target;
    const clampedX = THREE.MathUtils.clamp(target.x, -maxX, maxX);
    const clampedZ = THREE.MathUtils.clamp(target.z, -maxZ, maxZ);

    if (clampedX !== target.x || clampedZ !== target.z) {
      target.x = clampedX;
      target.z = clampedZ;
      controls.update();
    }
  });

  return null;
}
