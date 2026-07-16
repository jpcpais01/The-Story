import { z } from "zod";
import { sectionSchema, imageRefSchema, tagsField } from "./shared.schema";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dateLabel: z.string().min(1, "Date label is required"),
  sortValue: z.number(),
  tags: tagsField,
  coverImage: imageRefSchema.nullable().optional(),
  summary: z.string().min(1, "A short summary is required"),
  sections: z.array(sectionSchema),
  gallery: z.array(imageRefSchema),
  relatedCivilizationSlugs: z.array(z.string()),
  relatedLocationSlugs: z.array(z.string()),
});

export type EventFormValues = z.infer<typeof eventSchema>;
