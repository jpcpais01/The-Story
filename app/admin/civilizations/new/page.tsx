import { listEvents } from "@/lib/firestore/events.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { CivilizationForm } from "@/components/admin/CivilizationForm";

export default async function NewCivilizationPage() {
  const [events, locations] = await Promise.all([listEvents(), listLocations()]);

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">New Civilization</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Build the entry from repeatable sections.</p>
      <CivilizationForm
        eventOptions={events.map((e) => ({ slug: e.slug, title: e.title }))}
        locationOptions={locations.map((l) => ({ slug: l.slug, title: l.name }))}
      />
    </div>
  );
}
