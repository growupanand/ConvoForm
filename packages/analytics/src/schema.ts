import { z } from "zod";

export const userIdentity = z.object({
  userId: z.string().min(1),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type UserIdentity = z.infer<typeof userIdentity>;
