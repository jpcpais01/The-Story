import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { adminAuth } from "@/lib/firebase/admin-auth";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured) {
    // Dev-store mode: nothing is cached, so there's nothing to revalidate.
    return NextResponse.json({ revalidated: false, reason: "not-configured" });
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await adminAuth!.verifyIdToken(token).catch(() => null);
  if (!decoded?.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { tags } = (await request.json()) as { tags: string[] };
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags });
}
