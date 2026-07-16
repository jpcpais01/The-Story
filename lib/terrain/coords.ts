/** Converts a world-space X/Z on the terrain plane to normalized map (u, v). */
export function toUv(
  worldX: number,
  worldZ: number,
  widthUnits: number,
  depthUnits: number
): { u: number; v: number } {
  return {
    u: worldX / widthUnits + 0.5,
    v: 1 - (worldZ / depthUnits + 0.5),
  };
}

/** Converts normalized map (u, v) back to world-space X/Z on the terrain plane. */
export function fromUv(
  u: number,
  v: number,
  widthUnits: number,
  depthUnits: number
): { x: number; z: number } {
  return {
    x: (u - 0.5) * widthUnits,
    z: (0.5 - v) * depthUnits,
  };
}
