import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { devStore } from "@/lib/dev-store/store";
import type { GalaxyDoc } from "@/types/firestore";

export async function PUT(request: Request) {
  if (isFirebaseAdminConfigured) {
    return NextResponse.json({ error: "Dev store disabled: Firebase is configured" }, { status: 409 });
  }
  const patch = (await request.json()) as Partial<GalaxyDoc>;
  const galaxy = devStore.updateGalaxy(patch);
  return NextResponse.json(galaxy);
}
