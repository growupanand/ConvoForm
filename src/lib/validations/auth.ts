import { z } from "zod";

export const userAuthSchema = z.object({
  email: z.string().email(),
  csrfToken: z.string().min(1),
});
