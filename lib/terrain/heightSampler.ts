export interface HeightmapData {
  data: Float32Array;
  width: number;
  height: number;
}

/**
 * Bilinear-interpolated elevation lookup, 0..1 normalized.
 * u/v are normalized map coordinates (0..1). Shared by the terrain mesh build
 * and by pin placement/elevation, so pins always sit exactly on the visible surface.
 */
export function sampleHeight({ data, width, height }: HeightmapData, u: number, v: number): number {
  const cu = Math.min(1, Math.max(0, u));
  const cv = Math.min(1, Math.max(0, v));
  const x = cu * (width - 1);
  const y = cv * (height - 1);
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  const tx = x - x0;
  const ty = y - y0;

  const get = (xx: number, yy: number) => data[yy * width + xx];
  const top = get(x0, y0) * (1 - tx) + get(x1, y0) * tx;
  const bottom = get(x0, y1) * (1 - tx) + get(x1, y1) * tx;
  return top * (1 - ty) + bottom * ty;
}
