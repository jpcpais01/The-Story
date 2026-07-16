import { getWorld } from "@/lib/firestore/world.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { MapClientBoundary } from "@/components/map/MapClientBoundary";
import { MapHud } from "@/components/map/MapHud";
import { EDITABLE } from "@/config/site.config";

interface HomePageProps {
  searchParams: Promise<{ focus?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [world, locations, params] = await Promise.all([getWorld(), listLocations(), searchParams]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink-900">
      <MapClientBoundary
        world={world}
        locations={locations}
        editable={EDITABLE}
        initialSelectedSlug={params.focus ?? null}
      />
      <MapHud editable={EDITABLE} />
    </main>
  );
}
