import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getWorldById } from "@/lib/firestore/world.server";
import { MapClientBoundary } from "@/components/map/MapClientBoundary";
import { MapHud } from "@/components/map/MapHud";
import { EDITABLE } from "@/config/site.config";

interface PageProps {
  params: Promise<{ worldId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { worldId } = await params;
  const world = await getWorldById(worldId);
  if (!world) return {};
  return { title: world.name, description: world.tagline };
}

export default async function WorldPage({ params }: PageProps) {
  const { worldId } = await params;

  // The original world lives at the site root; keep one canonical URL.
  if (worldId === "main") redirect("/");

  const world = await getWorldById(worldId);
  if (!world) notFound();

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink-900">
      <MapClientBoundary world={world} locations={[]} editable={false} />
      <MapHud editable={false} />

      <div className="pointer-events-none absolute inset-x-0 top-20 flex flex-col items-center gap-1">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-gold-500/70">
          {world.planetName ? `World of ${world.planetName}` : "World"}
        </p>
        <h1 className="font-display text-2xl text-parchment-100 sm:text-3xl">{world.name}</h1>
      </div>

      {world.systemId && (
        <div className="pointer-events-none absolute left-4 top-20 sm:left-6">
          <Link
            href={`/galaxy/${world.systemId}`}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/60 px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur transition-colors hover:border-gold-400/40 hover:text-gold-300"
          >
            <ArrowLeft size={13} />
            Star system
          </Link>
        </div>
      )}

      {EDITABLE && (
        <div className="pointer-events-none absolute right-4 top-20 sm:right-6">
          <Link
            href={`/admin/world?world=${world.id}`}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/60 px-3 py-1.5 text-xs font-medium text-stone-300 backdrop-blur transition-colors hover:border-gold-400/40 hover:text-gold-300"
          >
            Edit world
          </Link>
        </div>
      )}
    </main>
  );
}
