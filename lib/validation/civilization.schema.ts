import { z } from "zod";
import { sectionSchema, imageRefSchema, tagsField } from "./shared.schema";

export const civilizationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: tagsField,
  coverImage: imageRefSchema.nullable().optional(),
  summary: z.string().min(1, "A short summary is required"),
  sections: z.array(sectionSchema),
  gallery: z.array(imageRefSchema),
  relatedEventSlugs: z.array(z.string()),
  relatedLocationSlugs: z.array(z.string()),
});

export type CivilizationFormValues = z.infer<typeof civilizationSchema>;
