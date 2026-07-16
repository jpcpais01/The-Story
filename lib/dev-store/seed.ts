import type {
  WorldDoc,
  LocationDoc,
  CivilizationDoc,
  EventDoc,
} from "@/types/firestore";

const now = Date.now();

export const seedWorld: WorldDoc = {
  id: "main",
  name: "The Story",
  tagline: "An atlas of a world still being written.",
  description:
    "This is placeholder world data. Sign in as admin and edit the World Settings panel to rename your world, write its description, and upload your own heightmap and hand-drawn map once you have them.",
  heightmapUrl: null,
  heightmapPublicId: null,
  heightmapSeed: 1337,
  overlayUrl: null,
  overlayPublicId: null,
  mapWidthUnits: 100,
  mapDepthUnits: 62,
  maxElevationUnits: 9,
  seaLevel: 0.42,
  contourIntervalCount: 36,
  updatedAt: now,
};

export const seedLocations: LocationDoc[] = [
  {
    slug: "haven-reach",
    name: "Haven Reach",
    type: "city",
    u: 0.42,
    v: 0.55,
    summary: "A harbor capital built into the cliffs of the Sundered Coast.",
    description:
      "Haven Reach is a sample location. Open it in the admin panel to replace this text, move its pin by clicking the map, or link it to a civilization and event.",
    coverImage: null,
    relatedCivilizationSlugs: ["the-tidebound"],
    relatedEventSlugs: ["the-long-landing"],
    createdAt: now,
    updatedAt: now,
  },
  {
    slug: "ashen-crown",
    name: "Ashen Crown",
    type: "ruin",
    u: 0.63,
    v: 0.3,
    summary: "The blackened remains of a highland fortress.",
    description:
      "Another sample pin, placed higher in the terrain's elevation to show how markers sit on the relief. Replace freely.",
    coverImage: null,
    relatedCivilizationSlugs: [],
    relatedEventSlugs: ["the-long-landing"],
    createdAt: now,
    updatedAt: now,
  },
  {
    slug: "lowmere-fen",
    name: "Lowmere Fen",
    type: "landmark",
    u: 0.28,
    v: 0.7,
    summary: "A wide wetland at the mouth of the delta.",
    description:
      "A third sample pin near sea level, to show the lowland end of the elevation palette.",
    coverImage: null,
    relatedCivilizationSlugs: [],
    relatedEventSlugs: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const seedCivilizations: CivilizationDoc[] = [
  {
    slug: "the-tidebound",
    title: "The Tidebound",
    tags: ["seafaring", "coastal", "sample"],
    coverImage: null,
    summary:
      "A confederation of harbor cities bound by a shared calendar of tides and trade.",
    sections: [
      {
        id: "origin",
        heading: "Origin",
        bodyHtml:
          "<p>This is a sample civilization entry. Each entry is built from repeatable sections like this one &mdash; add, remove, and reorder them freely from the admin panel, no code changes required.</p>",
        image: null,
      },
      {
        id: "culture",
        heading: "Culture",
        bodyHtml:
          "<p>Use sections to cover culture, government, notable figures, or anything else your lore needs. Each section can carry its own image.</p>",
        image: null,
      },
    ],
    gallery: [],
    relatedEventSlugs: ["the-long-landing"],
    relatedLocationSlugs: ["haven-reach"],
    createdAt: now,
    updatedAt: now,
  },
  {
    slug: "the-ashwardens",
    title: "The Ashwardens",
    tags: ["highland", "sample"],
    coverImage: null,
    summary: "Keepers of the old highland watch-fires, now mostly silent.",
    sections: [
      {
        id: "origin",
        heading: "Origin",
        bodyHtml:
          "<p>Another sample entry, shown here so the Codex grid and detail pages aren't empty on first run.</p>",
        image: null,
      },
    ],
    gallery: [],
    relatedEventSlugs: [],
    relatedLocationSlugs: [],
    createdAt: now,
    updatedAt: now,
  },
];

export const seedEvents: EventDoc[] = [
  {
    slug: "the-long-landing",
    title: "The Long Landing",
    dateLabel: "Third Age, Year 1",
    sortValue: 3001,
    tags: ["founding", "sample"],
    coverImage: null,
    summary: "The first fleets make landfall along the Sundered Coast.",
    sections: [
      {
        id: "account",
        heading: "Account",
        bodyHtml:
          "<p>Sample event content. Events use the same modular section system as civilizations, plus a free-text in-world date and a numeric sort value that controls their place on the Timeline.</p>",
        image: null,
      },
    ],
    gallery: [],
    relatedCivilizationSlugs: ["the-tidebound"],
    relatedLocationSlugs: ["haven-reach", "ashen-crown"],
    createdAt: now,
    updatedAt: now,
  },
];
