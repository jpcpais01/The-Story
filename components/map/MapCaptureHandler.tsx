"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMapStore } from "@/lib/store/mapStore";

interface MapCaptureHandlerProps {
  widthUnits: number;
  depthUnits: number;
  worldName: string;
}

const EXPORT_LONG_EDGE = 2048;

/**
 * Listens for `requestMapCapture()` and exports a clean top-down PNG of just
 * the map -- pins/compass/HUD are DOM overlays, not part of the WebGL scene,
 * so they're already excluded. Renders into an off-screen target with its own
 * camera whose frustum is set to exactly the plane's world-space bounds
 * (widthUnits x depthUnits), so there's no surrounding background and no need
 * to reconcile the live viewport's aspect ratio/zoom -- and the live view
 * itself is never touched.
 */
export function MapCaptureHandler({ widthUnits, depthUnits, worldName }: MapCaptureHandlerProps) {
  const captureRequestId = useMapStore((s) => s.captureRequestId);
  const { gl, scene } = useThree();

  useEffect(() => {
    if (captureRequestId === 0) return;

    const aspect = widthUnits / depthUnits;
    const outWidth = aspect >= 1 ? EXPORT_LONG_EDGE : Math.round(EXPORT_LONG_EDGE * aspect);
    const outHeight = aspect >= 1 ? Math.round(EXPORT_LONG_EDGE / aspect) : EXPORT_LONG_EDGE;

    const camera = new THREE.OrthographicCamera(
      -widthUnits / 2,
      widthUnits / 2,
      depthUnits / 2,
      -depthUnits / 2,
      0.1,
      200
    );
    camera.position.set(0, 50, 0);
    camera.up.set(0, 0, -1); // north (-Z) toward the top of the image
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    const renderTarget = new THREE.WebGLRenderTarget(outWidth, outHeight);
    const previousTarget = gl.getRenderTarget();

    gl.setRenderTarget(renderTarget);
    gl.render(scene, camera);

    const pixels = new Uint8Array(outWidth * outHeight * 4);
    gl.readRenderTargetPixels(renderTarget, 0, 0, outWidth, outHeight, pixels);

    gl.setRenderTarget(previousTarget);
    renderTarget.dispose();

    // WebGL reads the framebuffer bottom-to-top; canvas ImageData is top-to-bottom.
    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(outWidth, outHeight);
    for (let row = 0; row < outHeight; row++) {
      const srcRow = outHeight - 1 - row;
      const srcStart = srcRow * outWidth * 4;
      const dstStart = row * outWidth * 4;
      imageData.data.set(pixels.subarray(srcStart, srcStart + outWidth * 4), dstStart);
    }
    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
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
  }, [captureRequestId, widthUnits, depthUnits, worldName, gl, scene]);

  return null;
}
