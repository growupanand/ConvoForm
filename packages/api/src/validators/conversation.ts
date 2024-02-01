import { z } from "zod";

export const conversationSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["assistant", "user"]),
      content: z.string().min(1).max(255),
    }),
  ),
  isPreview: z.boolean().optional(),
});
