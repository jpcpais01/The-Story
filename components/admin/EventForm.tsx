"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Save, Trash2, Loader2 } from "lucide-react";
import slugify from "slugify";
import { eventSchema, type EventFormValues } from "@/lib/validation/event.schema";
import { eventsClient } from "@/lib/firestore/events.client";
import { ImageUploadField } from "./ImageUploadField";
import { TagsInput } from "./TagsInput";
import { RelationPicker } from "./RelationPicker";
import { SectionsEditor } from "./SectionsEditor";
import type { EventDoc } from "@/types/firestore";

interface EventFormProps {
  event?: EventDoc;
  civilizationOptions: { slug: string; title: string }[];
  locationOptions: { slug: string; title: string }[];
}

export function EventForm({ event, civilizationOptions, locationOptions }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      dateLabel: event?.dateLabel ?? "",
      sortValue: event?.sortValue ?? 0,
      tags: event?.tags ?? [],
      coverImage: event?.coverImage ?? null,
      summary: event?.summary ?? "",
      sections: event?.sections ?? [],
      gallery: event?.gallery ?? [],
      relatedCivilizationSlugs: event?.relatedCivilizationSlugs ?? [],
      relatedLocationSlugs: event?.relatedLocationSlugs ?? [],
    },
  });

  async function onSubmit(values: EventFormValues) {
    const slug = event?.slug ?? slugify(values.title, { lower: true, strict: true });
    await eventsClient.save({
      ...values,
      slug,
      createdAt: event?.createdAt,
    });
    router.push("/admin/events");
    router.refresh();
  }

  async function handleDelete() {
    if (!event || !confirm(`Delete "${event.title}"?`)) return;
    setDeleting(true);
    await eventsClient.remove(event.slug);
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <Controller
        control={control}
        name="coverImage"
        render={({ field }) => <ImageUploadField value={field.value} onChange={field.onChange} label="Cover image" />}
      />

      <Field label="Title" error={errors.title?.message}>
        <input {...register("title")} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="In-world date" error={errors.dateLabel?.message}>
          <input {...register("dateLabel")} placeholder="Third Age, Year 1204" className={inputClass} />
        </Field>
        <Field label="Sort value (for Timeline order)" error={errors.sortValue?.message}>
          <input type="number" step="any" {...register("sortValue", { valueAsNumber: true })} className={inputClass} />
        </Field>
      </div>

      <Field label="Tags">
        <Controller control={control} name="tags" render={({ field }) => <TagsInput value={field.value} onChange={field.onChange} />} />
      </Field>

      <Field label="Short summary" error={errors.summary?.message}>
        <textarea {...register("summary")} rows={2} className={inputClass} />
      </Field>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">Sections</p>
        <SectionsEditor control={control} name="sections" />
      </div>

      <Controller
        control={control}
        name="relatedCivilizationSlugs"
        render={({ field }) => (
          <RelationPicker label="Related civilizations" options={civilizationOptions} value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="relatedLocationSlugs"
        render={({ field }) => (
          <RelationPicker label="Related locations" options={locationOptions} value={field.value} onChange={field.onChange} />
        )}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isEdit ? "Save changes" : "Create event"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
