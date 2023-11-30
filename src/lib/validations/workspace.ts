import { z } from "zod";

export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(255),
});

export const workspaceUpdateSchema = z.object({
  name: z.string().min(1).max(255),
});
