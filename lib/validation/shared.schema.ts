import { z } from "zod";

export const imageRefSchema = z.object({
  url: z.string(),
  publicId: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
});

export const sectionSchema = z.object({
  id: z.string(),
  heading: z.string().min(1, "Section heading is required"),
  bodyHtml: z.string(),
  image: imageRefSchema.nullable().optional(),
});

export const tagsField = z.array(z.string());
