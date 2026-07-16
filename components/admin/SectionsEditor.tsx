"use client";

import { useFieldArray, Controller, type Control, type FieldValues, type ArrayPath, type Path } from "react-hook-form";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploadField } from "./ImageUploadField";
import type { Section } from "@/types/firestore";

interface SectionsEditorProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function SectionsEditor<T extends FieldValues>({ control, name }: SectionsEditorProps<T>) {
  const { fields, append, remove, move } = useFieldArray({ control, name: name as ArrayPath<T> });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
        <div key={field.id} className="rounded-xl border border-white/10 bg-ink-800/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-stone-500">Section {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                className="rounded p-1 text-stone-500 hover:text-stone-200 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                className="rounded p-1 text-stone-500 hover:text-stone-200 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button type="button" onClick={() => remove(index)} className="rounded p-1 text-stone-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <Controller
            control={control}
            name={`${name}.${index}.heading` as Path<T>}
            render={({ field: f }) => (
              <input
                {...f}
                placeholder="Section heading"
                className="mb-3 w-full rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm font-medium text-stone-200 placeholder:text-stone-500 focus:border-gold-400/40 focus:outline-none"
              />
            )}
          />

          <Controller
            control={control}
            name={`${name}.${index}.image` as Path<T>}
            render={({ field: f }) => (
              <div className="mb-3 max-w-xs">
                <ImageUploadField value={f.value} onChange={f.onChange} label="Section image (optional)" />
              </div>
            )}
          />

          <Controller
            control={control}
            name={`${name}.${index}.bodyHtml` as Path<T>}
            render={({ field: f }) => <RichTextEditor value={f.value} onChange={f.onChange} />}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append(
            { id: crypto.randomUUID(), heading: "", bodyHtml: "", image: null } as Section as never
          )
        }
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 py-3 text-sm font-medium text-stone-400 hover:border-gold-400/40 hover:text-gold-300"
      >
        <Plus size={15} />
        Add section
      </button>
    </div>
  );
}
