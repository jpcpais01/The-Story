"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Save, Trash2, Loader2 } from "lucide-react";
import slugify from "slugify";
import { civilizationSchema, type CivilizationFormValues } from "@/lib/validation/civilization.schema";
import { civilizationsClient } from "@/lib/firestore/civilizations.client";
import { ImageUploadField } from "./ImageUploadField";
import { TagsInput } from "./TagsInput";
import { RelationPicker } from "./RelationPicker";
import { SectionsEditor } from "./SectionsEditor";
import type { CivilizationDoc } from "@/types/firestore";

interface CivilizationFormProps {
  civilization?: CivilizationDoc;
  eventOptions: { slug: string; title: string }[];
  locationOptions: { slug: string; title: string }[];
}

export function CivilizationForm({ civilization, eventOptions, locationOptions }: CivilizationFormProps) {
  const router = useRouter();
  const isEdit = Boolean(civilization);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CivilizationFormValues>({
    resolver: zodResolver(civilizationSchema),
    defaultValues: {
      title: civilization?.title ?? "",
      tags: civilization?.tags ?? [],
      coverImage: civilization?.coverImage ?? null,
      summary: civilization?.summary ?? "",
      sections: civilization?.sections ?? [],
      gallery: civilization?.gallery ?? [],
      relatedEventSlugs: civilization?.relatedEventSlugs ?? [],
      relatedLocationSlugs: civilization?.relatedLocationSlugs ?? [],
    },
  });

  async function onSubmit(values: CivilizationFormValues) {
    const slug = civilization?.slug ?? slugify(values.title, { lower: true, strict: true });
    await civilizationsClient.save({
      ...values,
      slug,
      createdAt: civilization?.createdAt,
    });
    router.push("/admin/civilizations");
    router.refresh();
  }

  async function handleDelete() {
    if (!civilization || !confirm(`Delete "${civilization.title}"?`)) return;
    setDeleting(true);
    await civilizationsClient.remove(civilization.slug);
    router.push("/admin/civilizations");
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
        name="relatedEventSlugs"
        render={({ field }) => (
          <RelationPicker label="Related events" options={eventOptions} value={field.value} onChange={field.onChange} />
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
          {isEdit ? "Save changes" : "Create civilization"}
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
