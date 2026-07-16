import { getWorld } from "@/lib/firestore/world.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listEvents } from "@/lib/firestore/events.server";
import { LocationForm } from "@/components/admin/LocationForm";

export default async function NewLocationPage() {
  const [world, locations, civilizations, events] = await Promise.all([
    getWorld(),
    listLocations(),
    listCivilizations(),
    listEvents(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">New Location</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Click the map to place this pin.</p>
      <LocationForm
        world={world}
        existingLocations={locations}
        civilizationOptions={civilizations.map((c) => ({ slug: c.slug, title: c.title }))}
        eventOptions={events.map((e) => ({ slug: e.slug, title: e.title }))}
      />
    </div>
  );
}
