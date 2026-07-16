import { z } from "zod";

export const worldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string(),
  mapWidthUnits: z.number().positive(),
  mapDepthUnits: z.number().positive(),
  maxElevationUnits: z.number().positive(),
  seaLevel: z.number().min(0.05).max(0.95),
});

export type WorldFormValues = z.infer<typeof worldSchema>;
