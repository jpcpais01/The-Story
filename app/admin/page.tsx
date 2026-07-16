import Link from "next/link";
import { getWorld } from "@/lib/firestore/world.server";
import { listLocations } from "@/lib/firestore/locations.server";
import { listCivilizations } from "@/lib/firestore/civilizations.server";
import { listEvents } from "@/lib/firestore/events.server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export default async function AdminDashboardPage() {
  const [world, locations, civilizations, events] = await Promise.all([
    getWorld(),
    listLocations(),
    listCivilizations(),
    listEvents(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Welcome back</h1>
      <p className="mt-1 text-sm text-stone-400">Editing “{world.name}”.</p>

      {!isFirebaseAdminConfigured && (
        <div className="mt-4 rounded-lg border border-gold-400/30 bg-gold-500/10 px-4 py-3 text-sm text-gold-200">
          Running in local dev-store mode — changes here are kept in memory and reset when the
          dev server restarts. Complete <code className="text-gold-100">SETUP.md</code> to connect
          a real Firebase project and Cloudinary account.
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Locations" value={locations.length} href="/admin/locations" />
        <StatCard label="Civilizations" value={civilizations.length} href="/admin/civilizations" />
        <StatCard label="Events" value={events.length} href="/admin/events" />
        <StatCard label="World" value={1} href="/admin/world" />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/locations/new"
          className="rounded-full bg-gold-500 px-4 py-2 text-sm font-medium text-ink-950 hover:opacity-90"
        >
          + New Location
        </Link>
        <Link
          href="/admin/civilizations/new"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-stone-200 hover:bg-white/5"
        >
          + New Civilization
        </Link>
        <Link
          href="/admin/events/new"
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-stone-200 hover:bg-white/5"
        >
          + New Event
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-ink-800/60 p-4 transition-colors hover:border-gold-400/30"
    >
      <p className="font-display text-2xl text-parchment-100">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{label}</p>
    </Link>
  );
}
