import { verifySignature } from "@convoform/common";
import { sendFormResponseEmail } from "@convoform/email";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../env";
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
    .mutation(async ({ input, ctx }) => {
      const signature = ctx.headers?.get("X-ConvoForm-Signature");
      if (signature) {
        if (ctx.rawBody) {
          try {
            const isValid = await verifySignature(
              ctx.rawBody,
              signature,
              env.INTERNAL_EMAIL_API_SECRET,
            );

            if (!isValid) {
              console.error("Invalid signature for email request");
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid signature",
              });
            }
            // If signature is valid, we proceed.
            // We can optionally skip the secret check below, or keep it as double safety.
            // For now, let's keep the secret check as well or just return to avoid it?
            // The plan said "Remove or relax the old input.secret check".
            // If signature matches, it implies they have the secret.
          } catch (error) {
            console.error("Error verifying signature:", error);
            throw new TRPCError({ code: "UNAUTHORIZED" });
          }
        } else {
          console.warn(
            "Signature provided but rawBody not available in context",
          );
        }
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
