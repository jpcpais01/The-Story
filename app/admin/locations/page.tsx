import { listLocations } from "@/lib/firestore/locations.server";
import { LocationsListClient } from "@/components/admin/LocationsListClient";

export default async function AdminLocationsPage() {
  const locations = await listLocations();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Locations</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Pins that appear on the atlas.</p>
      <LocationsListClient locations={locations} />
    </div>
  );
}
