import { z } from "zod";

export const commitCategories = ["features", "improvements", "fixes"] as const;

export type CommitCategory = (typeof commitCategories)[number];

export const commitSchema = z.object({
  message: z.string(),
  href: z.string(),
});

export type Commit = z.infer<typeof commitSchema>;

export const releaseSchema = z.object({
  title: z.string(),
  tag: z.string(),
  isoDate: z.string(),
  commits: z.object({
    features: z.array(commitSchema),
    improvements: z.array(commitSchema),
    fixes: z.array(commitSchema),
  }),
});

export type Release = z.infer<typeof releaseSchema>;

export const changeLogSchema = z.array(releaseSchema);
