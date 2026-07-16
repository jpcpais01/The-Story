"use client";

import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import type { ImageRef } from "@/types/firestore";

export const isCloudinaryConfigured = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

function readAsDataUrlWithSize(file: File): Promise<{ url: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ url, width: 0, height: 0 });
      img.src = url;
    };
    reader.readAsDataURL(file);
  });
}

async function authHeader(): Promise<Record<string, string>> {
  if (!isFirebaseConfigured || !auth?.currentUser) return {};
  const token = await auth.currentUser.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Uploads via signed Cloudinary request when configured; otherwise falls back
 * to an inline data URL so the admin flow is fully usable before you've set
 * up a Cloudinary account (see .env.example / SETUP.md).
 */
export async function uploadImage(file: File, folder = "the-story"): Promise<ImageRef> {
  if (!isCloudinaryConfigured) {
    const { url, width, height } = await readAsDataUrlWithSize(file);
    return { url, publicId: `local-${crypto.randomUUID()}`, width, height, alt: "" };
  }

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Could not get an upload signature");
  const sign = (await signRes.json()) as {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
  };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed");
  const result = (await uploadRes.json()) as {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  };

  return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, alt: "" };
}

export async function deleteImage(image: ImageRef): Promise<void> {
  if (!isCloudinaryConfigured || image.publicId.startsWith("local-")) return;
  await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify({ publicId: image.publicId }),
  }).catch(() => {});
}
