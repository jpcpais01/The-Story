"use client";

interface RelationOption {
  slug: string;
  title: string;
}

interface RelationPickerProps {
  label: string;
  options: RelationOption[];
  value: string[];
  onChange: (slugs: string[]) => void;
}

export function RelationPicker({ label, options, value, onChange }: RelationPickerProps) {
  if (options.length === 0) return null;

  function toggle(slug: string) {
    onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value.includes(option.slug);
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => toggle(option.slug)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-gold-400/50 bg-gold-500/15 text-gold-300"
                  : "border-white/10 text-stone-400 hover:text-stone-200"
              }`}
            >
              {option.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
