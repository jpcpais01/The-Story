import type { HeightmapData } from "./heightSampler";

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Rasterizes an uploaded grayscale heightmap image (white = high, black = low)
 * into the same HeightmapData shape the procedural placeholder produces, so
 * Terrain doesn't need to know which source it came from.
 */
export async function loadHeightmapFromUrl(url: string, size = 256): Promise<HeightmapData> {
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size).data;

  const data = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    data[i] = imageData[i * 4] / 255;
  }
  return { data, width: size, height: size };
}
