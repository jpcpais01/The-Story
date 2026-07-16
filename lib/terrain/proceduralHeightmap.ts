import { createNoise2D } from "simplex-noise";
import { mulberry32, smoothstep } from "./random";
import type { HeightmapData } from "./heightSampler";

function fbm(
  noise2D: (x: number, y: number) => number,
  x: number,
  y: number,
  octaves: number,
  lacunarity: number,
  gain: number
): number {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let maxAmp = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amplitude * noise2D(x * frequency, y * frequency);
    maxAmp += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return sum / maxAmp; // -1..1
}

/**
 * A stand-in continent used until a real heightmap is uploaded.
 *
 * `width`/`height` should be proportional to the world's actual map aspect
 * ratio (default 2:1) -- noise is sampled in aspect-corrected coordinates so
 * a "round" continent feature looks round once displayed, instead of being
 * stretched to fill a non-square grid.
 *
 * The landmass shape comes from low-frequency, domain-warped noise rather
 * than a fixed radial falloff from the grid center, so land can end up
 * anywhere on the map instead of always clustering in the middle.
 */
export function generateProceduralHeightmap(width = 512, height = 256, seed = 1337): HeightmapData {
  const shapeNoise = createNoise2D(mulberry32(seed));
  const warpNoise = createNoise2D(mulberry32(seed + 101));
  const detailNoise = createNoise2D(mulberry32(seed + 202));

  const data = new Float32Array(width * height);
  const aspect = width / height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Proportional coordinates: nx spans [-aspect/2, aspect/2], ny spans
      // [-0.5, 0.5] -- a noise feature is the same physical size on both axes.
      const nx = (x / (width - 1) - 0.5) * aspect;
      const ny = y / (height - 1) - 0.5;

      // Domain warp: offset the sampling position with a second noise field
      // so coastlines read as organic rather than perfectly round/blobby.
      const warpStrength = 0.35;
      const wx = nx + warpNoise(nx * 1.5, ny * 1.5) * warpStrength;
      const wy = ny + warpNoise(nx * 1.5 + 50, ny * 1.5 + 50) * warpStrength;

      // Continent shape: low-frequency fBm. No fixed center bias -- across
      // different seeds, land can sit anywhere in the frame.
      const continent = fbm(shapeNoise, wx * 1.1, wy * 1.1, 4, 2.0, 0.5); // -1..1

      // Gentle rectangular vignette limited to a thin margin near the literal
      // edges, so the map still reads as a bounded landmass without pulling
      // every seed's terrain toward the exact center.
      const margin = 0.08;
      const edgeX = smoothstep(aspect / 2, aspect / 2 - margin * aspect, Math.abs(nx));
      const edgeY = smoothstep(0.5, 0.5 - margin, Math.abs(ny));
      const edgeFalloff = edgeX * edgeY;

      let landAmount = (continent * 0.5 + 0.5) * edgeFalloff; // 0..1
      landAmount = Math.pow(Math.max(0, landAmount), 1.2);

      // Detail: higher-frequency fBm for mountains/hills/valleys, blended in
      // more strongly once there's already some land (keeps deep ocean floor
      // comparatively calm while giving coastlines and interiors real relief).
      const detail = fbm(detailNoise, nx * 4.5, ny * 4.5, 5, 2.05, 0.5); // -1..1
      const detailInfluence = smoothstep(0.1, 0.55, landAmount);

      const h = landAmount + detail * 0.25 * detailInfluence;
      data[y * width + x] = Math.min(1, Math.max(0, h));
    }
  }

  return { data, width, height };
}
