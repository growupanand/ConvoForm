import { sendFormResponseEmail } from "@convoform/email";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const emailRouter = createTRPCRouter({
  sendFormResponse: publicProcedure
    .input(
      z.object({
        to: z.string().email(),
        formName: z.string(),
        responseId: z.string(),
        respondentEmail: z.string().optional(),
        responseLink: z.string(),
        secret: z.string(),
        currentFieldResponses: z
          .array(
            z.object({
              fieldName: z.string(),
              fieldValue: z.string().nullable(),
            }),
          )
          .optional(),
        transcript: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.secret !== process.env.INTERNAL_API_SECRET) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      await sendFormResponseEmail({
        to: input.to,
        formName: input.formName,
        responseId: input.responseId,
        respondentEmail: input.respondentEmail,
        currentFieldResponses: input.currentFieldResponses,
        transcript: input.transcript,
        metadata: input.metadata as any,
        responseLink: input.responseLink,
      });
    }),
});
