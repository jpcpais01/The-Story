import { CldImage } from "next-cloudinary";
import type { Section } from "@/types/firestore";

export function SectionRenderer({ sections }: { sections: Section[] }) {
  if (sections.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {sections.map((section) => (
        <section key={section.id}>
          <h2 className="font-display text-xl text-parchment-100 sm:text-2xl">{section.heading}</h2>
          {section.image && (
            <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-xl bg-ink-800">
              <CldImage
                src={section.image.publicId}
                alt={section.image.alt || section.heading}
                fill
                sizes="(min-width: 1024px) 720px, 90vw"
                className="object-cover"
              />
            </div>
          )}
          <div
            className="prose prose-lore prose-invert mt-4 max-w-none text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
          />
        </section>
      ))}
    </div>
  );
}
