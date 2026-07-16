"use client";

import { CldImage } from "next-cloudinary";
import type { ImageRef } from "@/types/firestore";

interface CodexImageProps {
  image: ImageRef;
  alt: string;
  sizes: string;
  className?: string;
}

/**
 * next-cloudinary's CldImage calls React hooks internally but ships with no
 * "use client" directive of its own, so importing it straight into a Server
 * Component compiles fine but crashes at render time (hooks run against the
 * server React runtime). This wrapper gives it a real client boundary.
 * Also mirrors ImageUploadField's local-upload fallback for public pages.
 */
export function CodexImage({ image, alt, sizes, className }: CodexImageProps) {
  if (image.publicId.startsWith("local-")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.url} alt={alt} className={`h-full w-full ${className ?? ""}`} />;
  }

  return <CldImage src={image.publicId} alt={alt} fill sizes={sizes} className={className} />;
}
