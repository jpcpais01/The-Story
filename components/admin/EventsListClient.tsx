"use client";

import { AdminEntityList } from "./AdminEntityList";
import { eventsClient } from "@/lib/firestore/events.client";
import type { EventDoc } from "@/types/firestore";

export function EventsListClient({ events }: { events: EventDoc[] }) {
  return (
    <AdminEntityList
      rows={events.map((e) => ({ slug: e.slug, title: e.title, subtitle: e.dateLabel }))}
      newHref="/admin/events/new"
      newLabel="New Event"
      editHrefFor={(slug) => `/admin/events/${slug}/edit`}
      onDelete={(slug) => eventsClient.remove(slug)}
      emptyLabel="No events yet."
    />
  );
}
