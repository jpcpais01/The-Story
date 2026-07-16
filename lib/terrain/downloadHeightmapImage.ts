import { generateProceduralHeightmap } from "./proceduralHeightmap";

/**
 * Renders the procedural heightmap for `seed` to a flat grayscale PNG and
 * triggers a browser download -- meant as a base to paint a hand-drawn map
 * on top of, so coastlines/mountains line up with the real elevation data.
 *
 * The image is generated at a higher resolution than the live 3D terrain
 * (same underlying noise field, just sampled more densely) and vertically
 * flipped so row 0 (top of the picture) matches the terrain's north edge --
 * i.e. what's at the top of the 3D map when the compass reads north-up.
 */
export function downloadHeightmapImage(seed: number, worldName: string, size = 1024): void {
  const heightmap = generateProceduralHeightmap(size, seed);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);

  for (let row = 0; row < size; row++) {
    const dataRow = size - 1 - row;
    for (let col = 0; col < size; col++) {
      const value = Math.round(heightmap.data[dataRow * size + col] * 255);
      const i = (row * size + col) * 4;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const slug = worldName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "world"}-heightmap-seed-${seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
