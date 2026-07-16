import { listEvents } from "@/lib/firestore/events.server";
import { EventsListClient } from "@/components/admin/EventsListClient";

export default async function AdminEventsPage() {
  const events = await listEvents();

  return (
    <div>
      <h1 className="font-display text-2xl text-parchment-100">Events</h1>
      <p className="mt-1 mb-6 text-sm text-stone-400">Moments recorded on the Timeline.</p>
      <EventsListClient events={events} />
    </div>
  );
}
