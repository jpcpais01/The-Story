import { generateProceduralHeightmap } from "./proceduralHeightmap";

/**
 * Renders the procedural heightmap for `seed` to a flat grayscale PNG and
 * triggers a browser download -- meant as a base to paint a hand-drawn map
 * on top of, so coastlines/mountains line up with the real elevation data.
 *
 * `aspectRatio` should match the world's mapWidthUnits / mapDepthUnits so the
 * exported image lines up with the live 3D terrain (no stretching). The
 * image is generated at a higher resolution than the live terrain (same
 * underlying noise field, just sampled more densely) and vertically flipped
 * so row 0 (top of the picture) matches the terrain's north edge -- i.e.
 * what's at the top of the 3D map when the compass reads north-up.
 */
export function downloadHeightmapImage(
  seed: number,
  worldName: string,
  aspectRatio = 2,
  height = 512
): void {
  const width = Math.max(2, Math.round(height * aspectRatio));
  const heightmap = generateProceduralHeightmap(width, height, seed);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(width, height);

  for (let row = 0; row < height; row++) {
    const dataRow = height - 1 - row;
    for (let col = 0; col < width; col++) {
      const value = Math.round(heightmap.data[dataRow * width + col] * 255);
      const i = (row * width + col) * 4;
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
