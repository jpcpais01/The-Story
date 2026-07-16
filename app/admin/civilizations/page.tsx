import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { CivilizationsListClient } from "@/components/admin/CivilizationsListClient";

export default async function AdminCivilizationsPage() {
  const civilizations = await listCivilizations();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Civilizations</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Peoples, cultures, and factions of the world.</p>
      <CivilizationsListClient civilizations={civilizations} />
    </div>
  );
}
