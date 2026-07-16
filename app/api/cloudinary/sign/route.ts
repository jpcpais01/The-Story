import { NextResponse } from "next/server";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/server";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isCloudinaryConfigured) {
    return NextResponse.json({ error: "Cloudinary is not configured yet" }, { status: 409 });
  }

  if (isFirebaseAdminConfigured) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = token ? await adminAuth!.verifyIdToken(token).catch(() => null) : null;
    if (!decoded?.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { folder = "the-story" } = (await request.json().catch(() => ({}))) as { folder?: string };
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });
}
