"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { uploadImage, deleteImage } from "@/lib/cloudinary/useImageUpload";
import type { ImageRef } from "@/types/firestore";

interface ImageUploadFieldProps {
  value: ImageRef | null | undefined;
  onChange: (image: ImageRef | null) => void;
  label?: string;
  aspect?: string;
}

export function ImageUploadField({ value, onChange, label = "Image", aspect = "aspect-video" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const image = await uploadImage(file);
      onChange(image);
    } catch {
      setError("Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (value) await deleteImage(value);
    onChange(null);
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>}
      <div className={`relative ${aspect} w-full overflow-hidden rounded-lg border border-dashed border-white/15 bg-ink-900`}>
        {value ? (
          <>
            {value.publicId.startsWith("local-") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.url} alt={value.alt || ""} className="h-full w-full object-cover" />
            ) : (
              <CldImage src={value.publicId} alt={value.alt || ""} fill sizes="400px" className="object-cover" />
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-950/80 text-stone-300 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-500 hover:text-stone-300"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-xs">{uploading ? "Uploading…" : "Click to upload"}</span>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
