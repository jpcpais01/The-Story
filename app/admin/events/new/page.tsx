import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { EventForm } from "@/components/admin/EventForm";

export default async function NewEventPage() {
  const [civilizations, locations] = await Promise.all([listCivilizations(), listLocations()]);

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">New Event</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Build the entry from repeatable sections.</p>
      <EventForm
        civilizationOptions={civilizations.map((c) => ({ slug: c.slug, title: c.title }))}
        locationOptions={locations.map((l) => ({ slug: l.slug, title: l.name }))}
      />
    </div>
  );
}
