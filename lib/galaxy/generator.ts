import { mulberry32 } from "@/lib/terrain/random";
import type { GalaxyDoc } from "@/types/firestore";

/**
 * Everything on the galaxy and system screens derives from these pure
 * functions of a seed. Rendering the same seed twice must always produce the
 * identical galaxy/system -- persistence is just "store the seed".
 */

// ---------------------------------------------------------------------------
// Seeding helpers
// ---------------------------------------------------------------------------

/** FNV-1a over the id string, mixed with the galaxy seed. Stable across runs. */
export function deriveSystemSeed(galaxySeed: number, systemId: string): number {
  let h = (0x811c9dc5 ^ galaxySeed) >>> 0;
  for (let i = 0; i < systemId.length; i++) {
    h ^= systemId.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** A system's effective seed: the admin override if regenerated, else derived. */
export function getSystemSeed(galaxy: GalaxyDoc, systemId: string): number {
  return galaxy.systemSeedOverrides[systemId] ?? deriveSystemSeed(galaxy.galaxySeed, systemId);
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function range(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

function rangeInt(rand: () => number, min: number, max: number): number {
  return Math.floor(range(rand, min, max + 1));
}

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

const NAME_STARTS = [
  "Al", "Ba", "Ca", "Dra", "El", "Fa", "Ga", "Ha", "Ily", "Ka", "Lu", "Ma",
  "Ne", "Or", "Pha", "Qua", "Rha", "Sa", "Tha", "Ul", "Va", "We", "Xa", "Ys", "Za",
];
const NAME_MIDS = ["ri", "la", "ve", "no", "da", "mi", "sha", "ke", "tur", "lo", "va", "ren", "zi", "the"];
const NAME_ENDS = ["ra", "n", "th", "s", "dor", "mir", "lis", "on", "ia", "us", "e", "ar", "is", "un"];
const NAME_SUFFIXES = ["", "", "", "", " Prime", " Minor", " Reach", " Deep", " Verge"];

export function generateStarName(rand: () => number): string {
  const mids = rand() < 0.4 ? 2 : 1;
  let name = pick(rand, NAME_STARTS);
  for (let i = 0; i < mids; i++) name += pick(rand, NAME_MIDS);
  name += pick(rand, NAME_ENDS);
  return name + pick(rand, NAME_SUFFIXES);
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// ---------------------------------------------------------------------------
// Galaxy
// ---------------------------------------------------------------------------

export interface StarSystemSummary {
  id: string;
  name: string;
  x: number;
  z: number;
  /** CSS hex color of the star's glow on the galaxy map. */
  color: string;
  /** Visual scale of the system's marker. */
  size: number;
}

export interface GalaxyStars {
  /** Interleaved xyz positions of decorative background stars. */
  positions: Float32Array;
  /** Interleaved rgb colors, matched to positions. */
  colors: Float32Array;
  /** Per-star twinkle phase, radians. */
  phases: Float32Array;
  /** Per-star point size multiplier. */
  sizes: Float32Array;
}

/** Star color classes, weighted toward cool whites/blues like a real sky. */
const STAR_CLASSES: ReadonlyArray<{ color: string; rgb: [number, number, number]; weight: number; size: [number, number] }> = [
  { color: "#aac6ff", rgb: [0.67, 0.78, 1.0], weight: 3, size: [0.9, 1.3] },
  { color: "#ffffff", rgb: [1.0, 1.0, 1.0], weight: 4, size: [0.8, 1.15] },
  { color: "#fff4da", rgb: [1.0, 0.96, 0.85], weight: 3, size: [0.85, 1.2] },
  { color: "#ffd9a0", rgb: [1.0, 0.85, 0.63], weight: 2, size: [1.0, 1.4] },
  { color: "#ff9f6e", rgb: [1.0, 0.62, 0.43], weight: 1, size: [1.1, 1.6] },
];

function pickStarClass(rand: () => number) {
  const total = STAR_CLASSES.reduce((s, c) => s + c.weight, 0);
  let roll = rand() * total;
  for (const c of STAR_CLASSES) {
    roll -= c.weight;
    if (roll <= 0) return c;
  }
  return STAR_CLASSES[1];
}

export const GALAXY_RADIUS = 100;

/**
 * Positions a point along a two-armed logarithmic spiral with gaussian-ish
 * scatter. Shared by the background starfield and the named systems so both
 * trace the same arms.
 */
function spiralPoint(rand: () => number): { x: number; z: number; rNorm: number } {
  // Bias radius toward the core, out to GALAXY_RADIUS.
  const rNorm = Math.pow(rand(), 0.72);
  const r = rNorm * GALAXY_RADIUS;
  const armCount = 2;
  const arm = Math.floor(rand() * armCount);
  // Logarithmic spiral: theta grows with log(r); wind ~2.2 turns across the disc.
  const theta =
    (arm * Math.PI * 2) / armCount +
    Math.log(1 + rNorm * 24) * 1.9 +
    (rand() + rand() + rand() - 1.5) * (0.55 - rNorm * 0.28);
  return { x: Math.cos(theta) * r, z: Math.sin(theta) * r, rNorm };
}

/**
 * Decorative background starfield. Seeded independently of the named systems
 * (see generateSystems) so the server can build the system list without
 * paying for 9000 stars.
 */
export function generateGalaxyStars(galaxySeed: number): GalaxyStars {
  const rand = mulberry32((galaxySeed ^ 0x9e3779b9) >>> 0);

  const STAR_COUNT = 9000;
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const phases = new Float32Array(STAR_COUNT);
  const sizes = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    let x: number, z: number, rNorm: number;
    const roll = rand();
    if (roll < 0.22) {
      // Core bulge: dense, warm.
      const r = Math.pow(rand(), 1.8) * GALAXY_RADIUS * 0.24;
      const a = rand() * Math.PI * 2;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      rNorm = r / GALAXY_RADIUS;
    } else if (roll < 0.34) {
      // Sparse halo scatter so the disc doesn't end at a hard edge.
      const r = Math.pow(rand(), 0.55) * GALAXY_RADIUS * 1.15;
      const a = rand() * Math.PI * 2;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
      rNorm = r / GALAXY_RADIUS;
    } else {
      ({ x, z, rNorm } = spiralPoint(rand));
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = (rand() - 0.5) * 3.5; // slim vertical thickness for parallax
    positions[i * 3 + 2] = z;

    const cls = pickStarClass(rand);
    // Core skews golden; arms keep their class color. Dim with a random twinkle base.
    const coreWarm = rNorm < 0.22 ? 0.25 : 0;
    const brightness = range(rand, 0.35, 1);
    colors[i * 3] = Math.min(1, (cls.rgb[0] + coreWarm) * brightness);
    colors[i * 3 + 1] = Math.min(1, (cls.rgb[1] + coreWarm * 0.75) * brightness);
    colors[i * 3 + 2] = cls.rgb[2] * brightness;

    phases[i] = rand() * Math.PI * 2;
    sizes[i] = range(rand, 0.6, 1.6) * (rand() < 0.03 ? 2.2 : 1);
  }

  return { positions, colors, phases, sizes };
}

/**
 * The named, clickable star systems. Cheap enough to run server-side for
 * validating a /galaxy/[systemId] URL and looking up its name.
 */
export function generateSystems(galaxySeed: number, systemCount = 44): StarSystemSummary[] {
  const rand = mulberry32((galaxySeed ^ 0x85ebca6b) >>> 0);

  const systems: StarSystemSummary[] = [];
  const minDist = GALAXY_RADIUS * 0.085;
  let attempts = 0;
  while (systems.length < systemCount && attempts < systemCount * 60) {
    attempts++;
    const p = spiralPoint(rand);
    // Keep named systems off the blinding core and the far fringe.
    const r = Math.hypot(p.x, p.z);
    if (r < GALAXY_RADIUS * 0.14 || r > GALAXY_RADIUS * 0.97) continue;
    if (systems.some((s) => Math.hypot(s.x - p.x, s.z - p.z) < minDist)) continue;
    const cls = pickStarClass(rand);
    systems.push({
      id: `sys-${systems.length}`,
      name: generateStarName(rand),
      x: p.x,
      z: p.z,
      color: cls.color,
      size: range(rand, cls.size[0], cls.size[1]),
    });
  }

  return systems;
}

// ---------------------------------------------------------------------------
// Solar systems
// ---------------------------------------------------------------------------

export type PlanetArchetype = "rocky" | "terra" | "gas" | "ice" | "lava";

export interface MoonSpec {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  phase: number;
  color: string;
}

export interface PlanetSpec {
  name: string;
  archetype: PlanetArchetype;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  /** Starting angle along the orbit, radians. */
  phase: number;
  axialTilt: number;
  spinSpeed: number;
  /** Palette the texture generator paints with (dark -> light). */
  palette: [string, string, string, string];
  textureSeed: number;
  rings: { inner: number; outer: number; color: string; opacity: number } | null;
  moons: MoonSpec[];
  /** True on the one planet that is the world charted on the Atlas. */
  isHomeWorld: boolean;
}

export interface SystemSpec {
  name: string;
  starColor: string;
  starRadius: number;
  planets: PlanetSpec[];
}

const ARCHETYPE_PALETTES: Record<PlanetArchetype, ReadonlyArray<[string, string, string, string]>> = {
  rocky: [
    ["#3d3630", "#6e5f4d", "#9c8a70", "#cfc0a5"],
    ["#402e2a", "#75503f", "#a4785c", "#d3ab86"],
    ["#33383d", "#5d6971", "#8b99a2", "#c0ccd3"],
  ],
  terra: [
    ["#123f66", "#1d6b52", "#7fa35a", "#e8e4d0"],
    ["#0f3a5e", "#28755f", "#94a860", "#f0ead6"],
    ["#173d54", "#3a7355", "#b0a56a", "#efe7d2"],
  ],
  gas: [
    ["#5a4632", "#8c6f4a", "#c2a06c", "#ecd9ac"],
    ["#3c4d63", "#5d7692", "#8fa8bf", "#d5e2ec"],
    ["#5f3a44", "#8f5e60", "#c08f83", "#eccbb4"],
    ["#4c3f63", "#71618f", "#9f8fbf", "#d9cfec"],
  ],
  ice: [
    ["#405a70", "#6d8aa0", "#a3bfd1", "#e8f2f8"],
    ["#3f5468", "#6b7f96", "#9fb4c8", "#e2ecf4"],
  ],
  lava: [
    ["#1d1512", "#4a2a1c", "#a33f16", "#ffb04d"],
    ["#191216", "#3f2320", "#992f24", "#ff8a3d"],
  ],
};

const MOON_COLORS = ["#b9b0a0", "#8f8676", "#cfc8ba", "#a3988a", "#c9b8a0"] as const;

const SYSTEM_STAR_COLORS = ["#ffd9a0", "#fff4da", "#ffffff", "#aac6ff", "#ff9f6e"] as const;

/**
 * The full recipe for one solar system, deterministic in `seed`.
 * `homeWorldName` names one mid-system planet after the Atlas world and marks
 * it as home; pass null for every other system.
 */
export function generateSystem(seed: number, systemName: string, homeWorldName: string | null): SystemSpec {
  const rand = mulberry32(seed);

  const starColor = pick(rand, SYSTEM_STAR_COLORS);
  const starRadius = range(rand, 2.6, 4.2);

  const planetCount = rangeInt(rand, 2, 9);
  // If this is the home system, pick a habitable-zone slot for the home world:
  // never the innermost scorched orbit, never the frozen outermost.
  const homeIndex = homeWorldName
    ? Math.min(planetCount - 1, Math.max(1, rangeInt(rand, 1, Math.max(1, planetCount - 2))))
    : -1;

  const planets: PlanetSpec[] = [];
  let orbit = starRadius + range(rand, 4, 6);

  for (let i = 0; i < planetCount; i++) {
    const isHome = i === homeIndex;
    const t = planetCount === 1 ? 0 : i / (planetCount - 1); // 0 hot -> 1 cold

    // Archetype odds shift with distance from the star; home world is always terra.
    let archetype: PlanetArchetype;
    if (isHome) archetype = "terra";
    else if (t < 0.2) archetype = rand() < 0.45 ? "lava" : "rocky";
    else if (t < 0.55) archetype = rand() < 0.3 ? "terra" : rand() < 0.5 ? "rocky" : "gas";
    else archetype = rand() < 0.45 ? "gas" : rand() < 0.6 ? "ice" : "rocky";

    const isGiant = archetype === "gas";
    const radius = isGiant ? range(rand, 1.5, 2.6) : range(rand, 0.55, 1.25);

    const rings =
      isGiant && rand() < 0.55
        ? {
            inner: radius * range(rand, 1.35, 1.55),
            outer: radius * range(rand, 1.9, 2.6),
            color: pick(rand, ["#cfc0a5", "#b9c4d1", "#d3ab86"] as const),
            opacity: range(rand, 0.35, 0.7),
          }
        : null;

    // Clear this planet's full extent (rings included) on the approach side
    // too, or a wide ring can reach back across the previous orbit.
    orbit += rings ? rings.outer : radius;
    const orbitRadius = orbit;

    const moonCount = isGiant ? rangeInt(rand, 1, 4) : rand() < 0.45 ? rangeInt(rand, 1, 2) : 0;
    const moons: MoonSpec[] = [];
    let moonOrbit = (rings ? rings.outer : radius) + range(rand, 0.5, 0.9);
    for (let m = 0; m < moonCount; m++) {
      const moonRadius = range(rand, 0.09, 0.22) * (isGiant ? 1.6 : 1);
      moonOrbit += moonRadius + range(rand, 0.25, 0.6);
      moons.push({
        name: `${systemName} ${ROMAN[i]}-${String.fromCharCode(97 + m)}`,
        radius: moonRadius,
        orbitRadius: moonOrbit,
        orbitSpeed: range(rand, 0.25, 0.7) * (rand() < 0.12 ? -1 : 1),
        phase: rand() * Math.PI * 2,
        color: pick(rand, MOON_COLORS),
      });
    }

    planets.push({
      name: isHome && homeWorldName ? homeWorldName : `${systemName} ${ROMAN[i]}`,
      archetype,
      radius,
      orbitRadius,
      // Kepler-flavored: farther planets crawl. Sign flip is rare retrograde spice.
      orbitSpeed: (2.2 / Math.pow(orbitRadius, 1.25)) * range(rand, 0.85, 1.15),
      phase: rand() * Math.PI * 2,
      axialTilt: range(rand, -0.45, 0.45),
      spinSpeed: range(rand, 0.05, 0.25),
      palette: pick(rand, ARCHETYPE_PALETTES[archetype]),
      textureSeed: Math.floor(rand() * 2 ** 31),
      rings,
      moons,
      isHomeWorld: isHome,
    });

    // Clearance to the next orbit: this planet's outer extent plus breathing room.
    orbit += (rings ? rings.outer : radius) + (moons.length ? moonOrbit - radius : 0) * 0.4 + range(rand, 3.2, 5.4);
  }

  return { name: systemName, starColor, starRadius, planets };
}
