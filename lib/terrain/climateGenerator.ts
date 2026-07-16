import { createNoise2D } from "simplex-noise";
import { mulberry32 } from "./random";
import type { HeightmapData } from "./heightSampler";

export interface ClimateData {
  temperature: HeightmapData;
  humidity: HeightmapData;
}

/**
 * Multi-source BFS flood fill from every underwater cell, giving each cell
 * its grid-distance to the nearest water. Normalized 0 (touching water) to 1
 * (as far from water as this map gets).
 */
function computeDistanceToWater(elevation: Float32Array, width: number, height: number, seaLevel: number): Float32Array {
  const dist = new Float32Array(width * height).fill(-1);
  const queue = new Int32Array(width * height);
  let queueLength = 0;

  for (let i = 0; i < elevation.length; i++) {
    if (elevation[i] < seaLevel) {
      dist[i] = 0;
      queue[queueLength++] = i;
    }
  }

  let head = 0;
  while (head < queueLength) {
    const i = queue[head++];
    const x = i % width;
    const y = (i / width) | 0;
    const d = dist[i];

    if (x > 0 && dist[i - 1] === -1) {
      dist[i - 1] = d + 1;
      queue[queueLength++] = i - 1;
    }
    if (x < width - 1 && dist[i + 1] === -1) {
      dist[i + 1] = d + 1;
      queue[queueLength++] = i + 1;
    }
    if (y > 0 && dist[i - width] === -1) {
      dist[i - width] = d + 1;
      queue[queueLength++] = i - width;
    }
    if (y < height - 1 && dist[i + width] === -1) {
      dist[i + width] = d + 1;
      queue[queueLength++] = i + width;
    }
  }

  let maxDist = 1;
  for (let i = 0; i < dist.length; i++) if (dist[i] > maxDist) maxDist = dist[i];

  const normalized = new Float32Array(width * height);
  for (let i = 0; i < dist.length; i++) normalized[i] = dist[i] < 0 ? 1 : dist[i] / maxDist;
  return normalized;
}

/**
 * Derives a temperature and humidity field from an elevation map (procedural
 * or uploaded, doesn't matter) plus a seed. Rules of thumb encoded here:
 * hotter near the vertical center ("equator"), colder at altitude and near
 * the top/bottom edges ("poles"); wetter near water, drier deep inland, with
 * a simple rain-shadow that dries out land downwind of tall terrain.
 */
export function generateClimate(elevationMap: HeightmapData, seaLevel: number, seed: number): ClimateData {
  const { data: elevation, width, height } = elevationMap;
  const temperature = new Float32Array(width * height);
  const humidity = new Float32Array(width * height);

  const varianceNoise = createNoise2D(mulberry32(seed + 5000));
  const windAngle = mulberry32(seed + 7777)() * Math.PI * 2;
  const windDx = Math.cos(windAngle);
  const windDy = Math.sin(windAngle);

  const distanceToWater = computeDistanceToWater(elevation, width, height, seaLevel);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const elev = elevation[i];
      const landElevation = Math.max(0, elev - seaLevel) / Math.max(1e-4, 1 - seaLevel);

      const v = y / (height - 1);
      const latitude = Math.abs(v - 0.5) * 2; // 0 at the equator, 1 at the poles
      let temp = 1 - latitude;
      temp -= landElevation * 0.55; // higher ground is colder
      temp += varianceNoise((x / width) * 5, (y / height) * 5) * 0.08;
      temperature[i] = Math.min(1, Math.max(0, temp));

      let hum = 1 - distanceToWater[i];
      // Rain shadow: look a few steps upwind for taller terrain blocking moisture.
      let upwindMaxElevation = elev;
      for (let step = 1; step <= 3; step++) {
        const sx = Math.round(x - windDx * step * 4);
        const sy = Math.round(y - windDy * step * 4);
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
        const upwindElevation = elevation[sy * width + sx];
        if (upwindElevation > upwindMaxElevation) upwindMaxElevation = upwindElevation;
      }
      hum -= Math.max(0, upwindMaxElevation - elev) * 0.6;
      hum += varianceNoise((x / width) * 7 + 100, (y / height) * 7 + 100) * 0.12;
      humidity[i] = Math.min(1, Math.max(0, hum));
    }
  }

  return {
    temperature: { data: temperature, width, height },
    humidity: { data: humidity, width, height },
  };
}
