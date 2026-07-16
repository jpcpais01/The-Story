// Seeds your real Firestore project with the same sample world/locations/
// civilizations/events used by local dev-store mode, so your live site isn't
// empty on first deploy. Safe to run multiple times (upserts by slug).
//
// Usage: node scripts/seed.mjs

import "dotenv/config";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY in .env.local"
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();
const now = Date.now();

const world = {
  id: "main",
  name: "The Story",
  tagline: "An atlas of a world still being written.",
  description:
    "Sign in as admin and edit World Settings to rename your world, write its description, and upload your own heightmap and hand-drawn map.",
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

const locations = [
  {
    slug: "haven-reach",
    name: "Haven Reach",
    type: "city",
    u: 0.42,
    v: 0.55,
    summary: "A harbor capital built into the cliffs of the Sundered Coast.",
    description: "Sample location -- edit or delete me from the admin panel.",
    coverImage: null,
    relatedCivilizationSlugs: ["the-tidebound"],
    relatedEventSlugs: ["the-long-landing"],
    createdAt: now,
    updatedAt: now,
  },
];

const civilizations = [
  {
    slug: "the-tidebound",
    title: "The Tidebound",
    tags: ["seafaring", "coastal", "sample"],
    coverImage: null,
    summary: "A confederation of harbor cities bound by a shared calendar of tides and trade.",
    sections: [
      {
        id: "origin",
        heading: "Origin",
        bodyHtml: "<p>Sample civilization -- edit or delete me from the admin panel.</p>",
        image: null,
      },
    ],
    gallery: [],
    relatedEventSlugs: ["the-long-landing"],
    relatedLocationSlugs: ["haven-reach"],
    createdAt: now,
    updatedAt: now,
  },
];

const events = [
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
        bodyHtml: "<p>Sample event -- edit or delete me from the admin panel.</p>",
        image: null,
      },
    ],
    gallery: [],
    relatedCivilizationSlugs: ["the-tidebound"],
    relatedLocationSlugs: ["haven-reach"],
    createdAt: now,
    updatedAt: now,
  },
];

await db.collection("world").doc("main").set(world, { merge: true });
for (const doc of locations) await db.collection("locations").doc(doc.slug).set(doc);
for (const doc of civilizations) await db.collection("civilizations").doc(doc.slug).set(doc);
for (const doc of events) await db.collection("events").doc(doc.slug).set(doc);

console.log(
  `Seeded 1 world doc, ${locations.length} location(s), ${civilizations.length} civilization(s), ${events.length} event(s).`
);
