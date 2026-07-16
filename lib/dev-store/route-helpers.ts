import "server-only";
import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export function devStoreGuard() {
  if (isFirebaseAdminConfigured) {
    return NextResponse.json(
      { error: "Dev store disabled: Firebase is configured" },
      { status: 409 }
    );
  }
  return null;
}

export function makeCollectionRoutes<Doc extends { slug: string }>(collection: {
  upsert: (doc: Doc) => Doc;
  remove: (slug: string) => void;
}) {
  return {
    async PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
      const guard = devStoreGuard();
      if (guard) return guard;
      const { slug } = await params;
      const body = (await request.json()) as Doc;
      const saved = collection.upsert({ ...body, slug });
      return NextResponse.json(saved);
    },
    async DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
      const guard = devStoreGuard();
      if (guard) return guard;
      const { slug } = await params;
      collection.remove(slug);
      return NextResponse.json({ ok: true });
    },
  };
}
