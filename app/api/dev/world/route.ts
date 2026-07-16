import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { WorldDoc } from "@/types/firestore";

export async function PUT(request: Request) {
  if (isFirebaseAdminConfigured) {
    return NextResponse.json({ error: "Dev store disabled: Firebase is configured" }, { status: 409 });
  }
  const patch = (await request.json()) as Partial<WorldDoc>;
  const world = devStore.updateWorld(patch);
  return NextResponse.json(world);
}
