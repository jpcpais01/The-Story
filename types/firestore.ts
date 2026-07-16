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
  id: "main";
  name: string;
  tagline: string;
  description: string;
  heightmapUrl: string | null;
  heightmapPublicId: string | null;
  overlayUrl: string | null;
  overlayPublicId: string | null;
  mapWidthUnits: number;
  mapDepthUnits: number;
  maxElevationUnits: number;
  seaLevel: number;
  contourIntervalCount: number;
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

export type CodexEntryType = "civilization" | "event" | "location";

export interface CodexEntrySummary {
  type: CodexEntryType;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  coverImage?: ImageRef | null;
}
