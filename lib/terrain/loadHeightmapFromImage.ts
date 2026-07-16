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
 * Terrain doesn't need to know which source it came from. `width`/`height`
 * should match the world's map aspect ratio -- upload an image with the same
 * proportions to avoid it being stretched.
 */
export async function loadHeightmapFromUrl(url: string, width: number, height: number): Promise<HeightmapData> {
  const img = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height).data;

  const data = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    data[i] = imageData[i * 4] / 255;
  }
  return { data, width, height };
}
