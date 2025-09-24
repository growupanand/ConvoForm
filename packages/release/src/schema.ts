import { z } from "zod/v4";

export const commitCategories = ["features", "improvements", "fixes"] as const;

export type CommitCategory = (typeof commitCategories)[number];

export const commitSchema = z.object({
  type: z.enum(commitCategories),
  message: z.string(),
  href: z.string(),
});

export type Commit = z.infer<typeof commitSchema>;

export const releaseSchema = z.object({
  version: z.string(),
  isoDate: z.string(),
  commits: z.array(commitSchema),
});

export type Release = z.infer<typeof releaseSchema>;

export const changeLogSchema = z.array(releaseSchema);
