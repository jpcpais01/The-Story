"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";

interface ZoomTiltControllerProps {
  controlsRef: React.RefObject<MapControlsImpl | null>;
  basePolarAngle: number;
  tiltStartZoom: number;
  tiltMaxZoom: number;
  maxTiltRadians: number;
}

/**
 * Keeps the map dead flat/top-down at normal zoom, then eases into a slight
 * tilt the further in you zoom -- a nice "leaning in" feel, driven purely by
 * zoom level rather than manual drag (min/max polar angle are pinned to the
 * same eased value every frame, so OrbitControls' own tilt input stays inert).
 */
export function ZoomTiltController({
  controlsRef,
  basePolarAngle,
  tiltStartZoom,
  tiltMaxZoom,
  maxTiltRadians,
}: ZoomTiltControllerProps) {
  const easedAngle = useRef(basePolarAngle);

  useFrame(() => {
    const controls = controlsRef.current;
    const camera = controls?.object;
    if (!controls || !(camera instanceof THREE.OrthographicCamera)) return;

    const t = THREE.MathUtils.clamp(
      (camera.zoom - tiltStartZoom) / Math.max(1e-4, tiltMaxZoom - tiltStartZoom),
      0,
      1
    );
    const smoothT = t * t * (3 - 2 * t);
    const targetAngle = basePolarAngle + smoothT * maxTiltRadians;

    easedAngle.current += (targetAngle - easedAngle.current) * 0.05;
    controls.minPolarAngle = easedAngle.current;
    controls.maxPolarAngle = easedAngle.current;
  });

  return null;
}
