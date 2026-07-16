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

  const { publicId } = (await request.json()) as { publicId?: string };
  if (!publicId || publicId.startsWith("local-")) {
    return NextResponse.json({ ok: true });
  }

  await cloudinary.uploader.destroy(publicId).catch(() => null);
  return NextResponse.json({ ok: true });
}
