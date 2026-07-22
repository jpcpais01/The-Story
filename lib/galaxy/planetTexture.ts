"use client";

import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { mulberry32 } from "@/lib/terrain/random";
import type { PlanetArchetype, PlanetSpec } from "./generator";

/**
 * Paints a planet's equirectangular surface onto a small canvas, entirely from
 * its spec (palette + textureSeed) -- the same spec always paints the same
 * planet. Noise is sampled on a cylinder (cos/sin of longitude) so the texture
 * wraps seamlessly.
 */

const TEX_W = 384;
const TEX_H = 192;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

/** Piecewise-linear ramp across the 4 palette stops for t in [0,1]. */
function ramp(stops: RGB[], t: number): RGB {
  const x = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(x);
  return lerpRgb(stops[i], stops[i + 1], x - i);
}

export function createPlanetTexture(spec: PlanetSpec): THREE.CanvasTexture {
  const rand = mulberry32(spec.textureSeed);
  const noise3D = createNoise3D(rand);

  const fbm = (x: number, y: number, z: number, octaves: number): number => {
    let value = 0;
    let amp = 0.5;
    let freq = 1;
    for (let o = 0; o < octaves; o++) {
      value += amp * noise3D(x * freq, y * freq, z * freq);
      amp *= 0.5;
      freq *= 2.05;
    }
    return value; // roughly [-1, 1]
  };

  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(TEX_W, TEX_H);
  const data = img.data;

  const stops = spec.palette.map(hexToRgb);
  const paint = archetypePainter(spec.archetype, fbm, rand);

  for (let py = 0; py < TEX_H; py++) {
    const v = py / (TEX_H - 1); // 0 north pole -> 1 south pole
    const lat = Math.abs(v - 0.5) * 2; // 0 equator -> 1 pole
    for (let px = 0; px < TEX_W; px++) {
      const u = px / TEX_W;
      // Seamless wrap: sample noise on a unit cylinder.
      const cx = Math.cos(u * Math.PI * 2);
      const cz = Math.sin(u * Math.PI * 2);
      const { t, glow } = paint(cx, cz, v, lat);
      const rgb = ramp(stops, t);
      const idx = (py * TEX_W + px) * 4;
      data[idx] = Math.min(255, rgb.r + glow.r);
      data[idx + 1] = Math.min(255, rgb.g + glow.g);
      data[idx + 2] = Math.min(255, rgb.b + glow.b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

type Painter = (
  cx: number,
  cz: number,
  v: number,
  lat: number
) => { t: number; glow: { r: number; g: number; b: number } };

const NO_GLOW = { r: 0, g: 0, b: 0 };

function archetypePainter(
  archetype: PlanetArchetype,
  fbm: (x: number, y: number, z: number, o: number) => number,
  rand: () => number
): Painter {
  switch (archetype) {
    case "gas": {
      const bandFreq = 4 + rand() * 6;
      const swirl = 0.35 + rand() * 0.5;
      return (cx, cz, v) => {
        const turb = fbm(cx * 1.6, v * 3.2, cz * 1.6, 4) * swirl;
        const band = Math.sin((v + turb * 0.22) * Math.PI * bandFreq);
        const detail = fbm(cx * 3.2, v * 9 + 40, cz * 3.2, 3) * 0.14;
        return { t: 0.5 + band * 0.34 + detail, glow: NO_GLOW };
      };
    }
    case "terra": {
      const seaLevel = 0.46 + rand() * 0.12;
      const capExtent = 0.78 + rand() * 0.12;
      return (cx, cz, v, lat) => {
        const h = fbm(cx * 1.5, v * 2.8, cz * 1.5, 5) * 0.5 + 0.5;
        let t: number;
        if (h < seaLevel) {
          t = 0.06 + (h / seaLevel) * 0.22; // deep -> shallow water
        } else {
          const landness = (h - seaLevel) / (1 - seaLevel);
          t = 0.4 + landness * 0.5;
        }
        // Polar caps ride over everything.
        if (lat > capExtent) t = Math.max(t, 0.9 + (lat - capExtent) * 0.5);
        return { t, glow: NO_GLOW };
      };
    }
    case "rocky": {
      const crackiness = rand() < 0.5;
      return (cx, cz, v) => {
        const base = fbm(cx * 2.1, v * 4.1, cz * 2.1, 5) * 0.5 + 0.5;
        const ridge = crackiness ? 1 - Math.abs(fbm(cx * 3.4, v * 6.5, cz * 3.4, 4)) : 0;
        return { t: base * 0.75 + ridge * 0.2, glow: NO_GLOW };
      };
    }
    case "ice": {
      return (cx, cz, v, lat) => {
        const base = fbm(cx * 1.8, v * 3.4, cz * 1.8, 4) * 0.5 + 0.5;
        // Bright body with darker fracture veins.
        const vein = Math.pow(1 - Math.abs(fbm(cx * 4.2, v * 8, cz * 4.2, 4)), 6);
        return { t: 0.55 + base * 0.4 - vein * 0.45 + lat * 0.1, glow: NO_GLOW };
      };
    }
    case "lava": {
      return (cx, cz, v) => {
        const crust = fbm(cx * 2.4, v * 4.6, cz * 2.4, 5) * 0.5 + 0.5;
        // Ridged noise inverted into glowing crack channels.
        const crack = Math.pow(1 - Math.abs(fbm(cx * 3.6, v * 7, cz * 3.6, 4)), 8);
        const t = crust * 0.5 + crack * 0.55;
        const heat = Math.max(0, crack - 0.25) * 220;
        return { t, glow: { r: heat, g: heat * 0.45, b: 0 } };
      };
    }
  }
}

/**
 * Concentric translucent bands for planetary rings. Meant for a geometry whose
 * UV `y` runs radially from inner (0) to outer (1) edge.
 */
export function createRingTexture(seed: number, colorHex: string): THREE.CanvasTexture {
  const rand = mulberry32(seed);
  const W = 8;
  const H = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const { r, g, b } = hexToRgb(colorHex);

  for (let y = 0; y < H; y++) {
    const t = y / (H - 1);
    // Density: several soft bands + gaps, fading at both edges.
    const band =
      0.45 +
      0.55 * Math.sin(t * Math.PI * (6 + rand() * 0.01) + rand() * 0.02) * Math.sin(t * Math.PI * 13);
    const edgeFade = Math.min(1, t * 6) * Math.min(1, (1 - t) * 4);
    const alpha = Math.max(0, band) * edgeFade;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    ctx.fillRect(0, y, W, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Soft radial glow sprite used for star halos on both screens. */
export function createGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const SIZE = 128;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, outer);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
