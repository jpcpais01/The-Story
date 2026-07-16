"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Save, Trash2, Loader2 } from "lucide-react";
import slugify from "slugify";
import { locationSchema, type LocationFormValues } from "@/lib/validation/location.schema";
import { locationsClient } from "@/lib/firestore/locations.client";
import { ImageUploadField } from "./ImageUploadField";
import { RelationPicker } from "./RelationPicker";
import { LocationMapPicker } from "./LocationMapPicker";
import { SectionsEditor } from "./SectionsEditor";
import { LOCATION_TYPES } from "@/types/firestore";
import type { LocationDoc, WorldDoc, ImageRef } from "@/types/firestore";

interface LocationFormProps {
  world: WorldDoc;
  existingLocations: LocationDoc[];
  civilizationOptions: { slug: string; title: string }[];
  eventOptions: { slug: string; title: string }[];
  location?: LocationDoc;
}

export function LocationForm({ world, existingLocations, civilizationOptions, eventOptions, location }: LocationFormProps) {
  const router = useRouter();
  const isEdit = Boolean(location);
  const [coverImage, setCoverImage] = useState<ImageRef | null>(location?.coverImage ?? null);
  const [deleting, setDeleting] = useState(false);
  const [positionSet, setPositionSet] = useState(Boolean(location));

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name ?? "",
      type: location?.type ?? "city",
      summary: location?.summary ?? "",
      description: location?.description ?? "",
      sections: location?.sections ?? [],
      u: location?.u ?? 0.5,
      v: location?.v ?? 0.5,
      relatedCivilizationSlugs: location?.relatedCivilizationSlugs ?? [],
      relatedEventSlugs: location?.relatedEventSlugs ?? [],
    },
  });

  const u = watch("u");
  const v = watch("v");

  async function onSubmit(values: LocationFormValues) {
    if (!positionSet) {
      alert("Set the location's position on the map first.");
      return;
    }
    const slug = location?.slug ?? slugify(values.name, { lower: true, strict: true });
    await locationsClient.save({
      ...values,
      slug,
      coverImage,
      createdAt: location?.createdAt,
    });
    router.push("/admin/locations");
    router.refresh();
  }

  async function handleDelete() {
    if (!location || !confirm(`Delete "${location.name}"?`)) return;
    setDeleting(true);
    await locationsClient.remove(location.slug);
    router.push("/admin/locations");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-6">
      <ImageUploadField value={coverImage} onChange={setCoverImage} label="Cover image" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Name" error={errors.name?.message}>
          <input {...register("name")} className={inputClass} />
        </Field>
        <Field label="Type">
          <select {...register("type")} className={inputClass}>
            {LOCATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Short summary" error={errors.summary?.message}>
        <input {...register("summary")} className={inputClass} />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register("description")} rows={5} className={inputClass} />
      </Field>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-500">Sections</p>
        <SectionsEditor control={control} name="sections" />
      </div>

      <Controller
        control={control}
        name="u"
        render={() => (
          <LocationMapPicker
            world={world}
            locations={existingLocations.filter((l) => l.slug !== location?.slug)}
            value={positionSet ? { u, v } : null}
            onPick={(uv) => {
              setValue("u", uv.u, { shouldValidate: true });
              setValue("v", uv.v, { shouldValidate: true });
              setPositionSet(true);
            }}
          />
        )}
      />

      <Controller
        control={control}
        name="relatedCivilizationSlugs"
        render={({ field }) => (
          <RelationPicker label="Related civilizations" options={civilizationOptions} value={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={control}
        name="relatedEventSlugs"
        render={({ field }) => (
          <RelationPicker label="Related events" options={eventOptions} value={field.value} onChange={field.onChange} />
        )}
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isEdit ? "Save changes" : "Create location"}
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
