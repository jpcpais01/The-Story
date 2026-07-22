export interface ImageRef {
  url: string;
  publicId: string;
  width: number;
  height: number;
  alt?: string;
}

export interface Section {
  id: string;
  heading: string;
  bodyHtml: string;
  image?: ImageRef | null;
}

export interface WorldDoc {
  /** "main" is the original Atlas world; created worlds get generated ids. */
  id: string;
  /** Star system this world's planet belongs to (null/absent for "main"). */
  systemId?: string | null;
  /** Name of the planet this world was created from (null/absent for "main"). */
  planetName?: string | null;
  name: string;
  tagline: string;
  description: string;
  heightmapUrl: string | null;
  heightmapPublicId: string | null;
  /** Seed for the procedural placeholder terrain, used whenever heightmapUrl is null. */
  heightmapSeed: number;
  /** How strongly detail noise (mountains/hills) perturbs elevation. Default 0.25. */
  terrainDetailWeight: number;
  /** Detail noise frequency -- higher = smaller, more numerous bumps. Default 4.5. */
  terrainDetailFrequency: number;
  /** Detail noise octave count -- more layers of finer texture. Default 5. */
  terrainDetailOctaves: number;
  /** Detail noise lacunarity -- how much finer each added octave is. Default 2.05. */
  terrainDetailLacunarity: number;
  overlayUrl: string | null;
  overlayPublicId: string | null;
  mapWidthUnits: number;
  mapDepthUnits: number;
  maxElevationUnits: number;
  seaLevel: number;
  updatedAt: number;
}

export const LOCATION_TYPES = ["city", "ruin", "landmark", "region", "other"] as const;

export type LocationType = (typeof LOCATION_TYPES)[number];

export interface LocationDoc {
  slug: string;
  name: string;
  type: LocationType;
  u: number;
  v: number;
  summary: string;
  description: string;
  coverImage?: ImageRef | null;
  sections: Section[];
  relatedCivilizationSlugs: string[];
  relatedEventSlugs: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CivilizationDoc {
  slug: string;
  title: string;
  tags: string[];
  coverImage?: ImageRef | null;
  summary: string;
  sections: Section[];
  gallery: ImageRef[];
  relatedEventSlugs: string[];
  relatedLocationSlugs: string[];
  createdAt: number;
  updatedAt: number;
}

export interface EventDoc {
  slug: string;
  title: string;
  dateLabel: string;
  sortValue: number;
  tags: string[];
  coverImage?: ImageRef | null;
  summary: string;
  sections: Section[];
  gallery: ImageRef[];
  relatedCivilizationSlugs: string[];
  relatedLocationSlugs: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GalaxyDoc {
  id: "main";
  /** Seed the entire galaxy (star positions, system placement, names) derives from. */
  galaxySeed: number;
  /**
   * Per-system seed overrides written by the admin "Regenerate" action.
   * A system's effective seed is systemSeedOverrides[systemId] if present,
   * otherwise derived deterministically from galaxySeed + systemId -- so the
   * same system always renders identically until explicitly regenerated.
   */
  systemSeedOverrides: Record<string, number>;
  /** Which star system contains the world charted on the Atlas. */
  homeSystemId: string;
  updatedAt: number;
}

export type CodexEntryType = "civilization" | "event" | "location";

export interface CodexEntrySummary {
  type: CodexEntryType;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  coverImage?: ImageRef | null;
}
