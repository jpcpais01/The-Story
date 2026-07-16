import { notFound } from "next/navigation";
import { getWorld } from "@/lib/firestore/world.server";
import { getLocation, listLocations } from "@/lib/firestore/locations.server";
import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listEvents } from "@/lib/firestore/events.server";
import { LocationForm } from "@/components/admin/LocationForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditLocationPage({ params }: PageProps) {
  const { slug } = await params;
  const [world, location, locations, civilizations, events] = await Promise.all([
    getWorld(),
    getLocation(slug),
    listLocations(),
    listCivilizations(),
    listEvents(),
  ]);
  if (!location) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Edit {location.name}</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Changes save directly to the atlas.</p>
      <LocationForm
        world={world}
        location={location}
        existingLocations={locations}
        civilizationOptions={civilizations.map((c) => ({ slug: c.slug, title: c.title }))}
        eventOptions={events.map((e) => ({ slug: e.slug, title: e.title }))}
      />
    </div>
  );
}
