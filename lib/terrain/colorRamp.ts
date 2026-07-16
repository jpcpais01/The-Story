import * as THREE from "three";

interface Stop {
  at: number;
  color: string;
}

/**
 * Builds a 256x1 hypsometric-tint gradient texture (deep water -> shore ->
 * lowland -> highland -> snowcap), keyed to the world's sea level. Sampled by
 * the terrain shader using each vertex's normalized elevation.
 */
export function buildColorRampTexture(seaLevel: number): THREE.Texture {
  const sea = Math.min(0.92, Math.max(0.08, seaLevel));
  const land = 1 - sea;

  const stops: Stop[] = [
    { at: 0, color: "#12314a" },
    { at: sea * 0.45, color: "#1f5578" },
    { at: sea * 0.82, color: "#4f95a8" },
    { at: sea * 0.985, color: "#e4d9ac" },
    { at: sea + land * 0.08, color: "#8fae5f" },
    { at: sea + land * 0.32, color: "#6f8f4c" },
    { at: sea + land * 0.58, color: "#a98653" },
    { at: sea + land * 0.8, color: "#8a8074" },
    { at: sea + land * 0.93, color: "#c9c3bc" },
    { at: 1, color: "#f8f6f1" },
  ];

  const width = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, width, 0);

  let lastAt = -1;
  for (const stop of stops) {
    const at = Math.min(1, Math.max(0, Math.max(stop.at, lastAt + 0.0001)));
    gradient.addColorStop(Math.min(1, at), stop.color);
    lastAt = at;
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
