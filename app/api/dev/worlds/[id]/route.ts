import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { WorldDoc } from "@/types/firestore";

function guard() {
  if (isFirebaseAdminConfigured) {
    return NextResponse.json({ error: "Dev store disabled: Firebase is configured" }, { status: 409 });
  }
  return null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = guard();
  if (denied) return denied;
  const { id } = await params;
  const patch = (await request.json()) as Partial<WorldDoc>;
  const world = devStore.updateWorld(patch, id);
  return NextResponse.json(world);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = guard();
  if (denied) return denied;
  const { id } = await params;
  if (id === "main") {
    return NextResponse.json({ error: "The original Atlas world cannot be deleted" }, { status: 400 });
  }
  devStore.deleteWorld(id);
  return NextResponse.json({ ok: true });
}
