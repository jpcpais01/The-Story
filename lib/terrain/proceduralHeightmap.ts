import { createNoise2D } from "simplex-noise";
import type { HeightmapData } from "./heightSampler";

// Deterministic seeded PRNG (mulberry32) so the placeholder continent is stable
// across reloads instead of reshuffling every render.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A stand-in continent used until a real heightmap is uploaded. Combines
 * fractal (fBm) noise with a radial falloff so it reads as an island/continent
 * silhouette with a coastline, rather than uniform noise.
 */
export function generateProceduralHeightmap(size = 256, seed = 1337): HeightmapData {
  const random = mulberry32(seed);
  const noise2D = createNoise2D(random);
  const data = new Float32Array(size * size);

  const octaves = 5;
  const lacunarity = 2.05;
  const gain = 0.5;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x / size - 0.5;
      const ny = y / size - 0.5;

      let amplitude = 1;
      let frequency = 2.2;
      let sum = 0;
      let maxAmp = 0;
      for (let o = 0; o < octaves; o++) {
        sum += amplitude * noise2D(nx * frequency, ny * frequency);
        maxAmp += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
      }
      const fbm = sum / maxAmp; // -1..1

      const dist = Math.sqrt(nx * nx + ny * ny) / 0.72; // 0 at center, ~1 at edge
      const falloff = 1 - smoothstep(0.55, 1.0, dist);

      let h = (fbm * 0.5 + 0.5) * falloff;
      h = Math.pow(Math.max(0, h), 1.35); // push more area toward lowland
      data[y * size + x] = Math.min(1, Math.max(0, h));
    }
  }

  return { data, width: size, height: size };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
