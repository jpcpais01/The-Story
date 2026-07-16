"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagsInput({ value, onChange }: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim().toLowerCase();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-ink-900 px-2 py-2">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs text-stone-300"
        >
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
            <X size={11} className="text-stone-500 hover:text-red-400" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={value.length === 0 ? "Add tags…" : ""}
        className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none"
      />
    </div>
  );
}
