import { notFound } from "next/navigation";
import { getEvent } from "@/lib/firestore/events.server";
import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { EventForm } from "@/components/admin/EventForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditEventPage({ params }: PageProps) {
  const { slug } = await params;
  const [event, civilizations, locations] = await Promise.all([
    getEvent(slug),
    listCivilizations(),
    listLocations(),
  ]);
  if (!event) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Edit {event.title}</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Changes save directly to the codex.</p>
      <EventForm
        event={event}
        civilizationOptions={civilizations.map((c) => ({ slug: c.slug, title: c.title }))}
        locationOptions={locations.map((l) => ({ slug: l.slug, title: l.name }))}
      />
    </div>
  );
}
