"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MapControls as MapControlsImpl } from "three-stdlib";
import { useMapStore } from "@/lib/store/mapStore";

interface MapCaptureHandlerProps {
  controlsRef: React.RefObject<MapControlsImpl | null>;
  fitZoom: number;
  worldName: string;
}

/**
 * Listens for `requestMapCapture()` (from the admin-only download button in
 * MapHud) and exports the current view as a PNG. Since pins/compass/HUD are
 * regular DOM elements layered on top of the canvas, not part of the WebGL
 * scene, they're naturally excluded -- this captures just the map itself.
 * Resets pan/zoom to frame the whole map first, so "the full map" is
 * literally what you get regardless of whatever you'd scrolled/zoomed to.
 */
export function MapCaptureHandler({ controlsRef, fitZoom, worldName }: MapCaptureHandlerProps) {
  const captureRequestId = useMapStore((s) => s.captureRequestId);
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (captureRequestId === 0) return;
    const controls = controlsRef.current;
    if (!controls || !(camera instanceof THREE.OrthographicCamera)) return;

    camera.zoom = fitZoom;
    controls.target.set(0, 0, 0);
    controls.update();
    camera.updateProjectionMatrix();

    gl.render(scene, camera);
    gl.domElement.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const slug = worldName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug || "world"}-map.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [captureRequestId, controlsRef, fitZoom, worldName, gl, scene, camera]);

  return null;
}
