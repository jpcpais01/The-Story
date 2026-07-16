/**
 * The single switch that separates your private, editable copy of this site from
 * the public, read-only deploy.
 *
 * - true  -> admin UI + /admin routes are available (sign-in still required to write data)
 * - false -> /admin is entirely unreachable (404), no edit affordances render anywhere
 *
 * Flip this before you commit/push. It is a UX convenience, not the security boundary --
 * see SETUP.md and firestore.rules for the real one (Firebase Auth + security rules).
 */
export const EDITABLE = true;

export const siteConfig = {
  worldNameFallback: "The Story",
  worldTaglineFallback: "An atlas of a world still being written.",
  mapWidthUnits: 120,
  mapDepthUnits: 60,
  maxElevationUnits: 9,
  defaultSeaLevel: 0.42,
  defaultContourIntervalCount: 36,
  terrainSegments: 256,
};
