import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  fieldName: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;
