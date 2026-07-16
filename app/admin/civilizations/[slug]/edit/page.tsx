import { notFound } from "next/navigation";
import { getCivilization } from "@/lib/firestore/civilizations.server";
import { listEvents } from "@/lib/firestore/events.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { CivilizationForm } from "@/components/admin/CivilizationForm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCivilizationPage({ params }: PageProps) {
  const { slug } = await params;
  const [civilization, events, locations] = await Promise.all([
    getCivilization(slug),
    listEvents(),
    listLocations(),
  ]);
  if (!civilization) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Edit {civilization.title}</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Changes save directly to the codex.</p>
      <CivilizationForm
        civilization={civilization}
        eventOptions={events.map((e) => ({ slug: e.slug, title: e.title }))}
        locationOptions={locations.map((l) => ({ slug: l.slug, title: l.name }))}
      />
    </div>
  );
}
