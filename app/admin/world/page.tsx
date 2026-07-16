import { getWorld } from "@/lib/firestore/world.server";
import { WorldSettingsForm } from "@/components/admin/WorldSettingsForm";

export default async function AdminWorldPage() {
  const world = await getWorld();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">World Settings</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">
        Controls the map that renders on the homepage, and the world&apos;s name shown throughout the site.
      </p>
      <WorldSettingsForm world={world} />
    </div>
  );
}
