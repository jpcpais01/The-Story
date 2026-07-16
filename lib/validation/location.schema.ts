import { z } from "zod";
import { LOCATION_TYPES } from "@/types/firestore";

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(LOCATION_TYPES),
  summary: z.string().min(1, "A short summary is required"),
  description: z.string().min(1, "A description is required"),
  u: z.number().min(0).max(1),
  v: z.number().min(0).max(1),
  relatedCivilizationSlugs: z.array(z.string()),
  relatedEventSlugs: z.array(z.string()),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
