import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { decrypt, encrypt } from "@convoform/common";
import { Schema } from "@convoform/db";
import { GoogleSheetsProvider } from "@convoform/integration";
import { and, eq } from "drizzle-orm";
import { env } from "../env";
import { internalProcedure } from "../procedures/internalProcedure";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const getGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google OAuth credentials");
  }

  return { clientId, clientSecret, redirectUri };
};

// Factory to get provider instance
// TODO: improvements to dependency injection or factory pattern
const getProvider = (providerName: string) => {
  switch (providerName) {
    case "google_sheets": {
      const { clientId, clientSecret, redirectUri } = getGoogleCredentials();
      return new GoogleSheetsProvider(clientId, clientSecret, redirectUri);
    }
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
};

export const integrationRouter = createTRPCRouter({
  // 1. List available integrations and user's connection status
  list: protectedProcedure.query(async ({ ctx }) => {
    const userIntegrations = await ctx.db.query.integration.findMany({
      where: eq(Schema.integration.userId, ctx.auth.userId),
    });

    const available = [
      {
        id: "google_sheets",
        name: "Google Sheets",
        icon: "google-sheets", // For UI
        connected: userIntegrations.some((i) => i.provider === "google_sheets"),
      },
    ];

    return available;
  }),

  // 2. Connect (Start OAuth)
  connect: protectedProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ input }) => {
      const provider = getProvider(input.provider);
      // We use a specific state prefix to identify this flow in the callback
      return { url: provider.getAuthUrl("integration_google_sheets") };
    }),

  // 3. Callback (Exchange code for tokens)
  callback: protectedProcedure
    .input(
      z.object({
        provider: z.string(),
        code: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const provider = getProvider(input.provider);
      const tokens = await provider.callback(input.code);

      // Encrypt tokens before storing
      const encryptionKey = env.ENCRYPTION_KEY;

      const encryptedAccessToken = await encrypt(
        tokens.accessToken,
        encryptionKey,
      );
      const encryptedRefreshToken = tokens.refreshToken
        ? await encrypt(tokens.refreshToken, encryptionKey)
        : undefined;

      // Upsert integration for user
      // Check if exists
      const existing = await ctx.db.query.integration.findFirst({
        where: and(
          eq(Schema.integration.userId, ctx.auth.userId),
          eq(Schema.integration.provider, input.provider),
        ),
      });

      if (existing) {
        await ctx.db
          .update(Schema.integration)
          .set({
            encryptedAccessToken,
            encryptedRefreshToken:
              encryptedRefreshToken ?? existing.encryptedRefreshToken, // Keep old refresh token if not provided new one
            expiresAt: tokens.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(Schema.integration.id, existing.id));
      } else {
        await ctx.db.insert(Schema.integration).values({
          userId: ctx.auth.userId,
          provider: input.provider,
          encryptedAccessToken,
          encryptedRefreshToken,
          expiresAt: tokens.expiresAt,
        });
      }

      return { success: true };
    }),

  // 4. List Integrations for a specific Form
  listForForm: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.formIntegration.findMany({
        where: eq(Schema.formIntegration.formId, input.formId),
        with: {
          integration: true,
        },
      });
    }),

  // 5. Manage (Enable/Disable/Configure for a form)
  manage: protectedProcedure
    .input(
      z.object({
        formId: z.string(),
        provider: z.string(),
        enabled: z.boolean(),
        config: z.record(z.string(), z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First find the user's integration record
      const userIntegration = await ctx.db.query.integration.findFirst({
        where: and(
          eq(Schema.integration.userId, ctx.auth.userId),
          eq(Schema.integration.provider, input.provider),
        ),
      });

      if (!userIntegration) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must connect to the provider first",
        });
      }

      // Check if form integration exists
      const existing = await ctx.db.query.formIntegration.findFirst({
        where: and(
          eq(Schema.formIntegration.formId, input.formId),
          eq(Schema.formIntegration.integrationId, userIntegration.id),
        ),
      });

      if (existing) {
        await ctx.db
          .update(Schema.formIntegration)
          .set({
            enabled: input.enabled,
            config: input.config
              ? { ...(existing.config as object), ...input.config }
              : existing.config,
          })
          .where(eq(Schema.formIntegration.id, existing.id));
      } else {
        await ctx.db.insert(Schema.formIntegration).values({
          formId: input.formId,
          integrationId: userIntegration.id,
          enabled: input.enabled,
          config: input.config || {},
        });
      }

      return { success: true };
    }),

  // 6. Disconnect (Delete integration)
  disconnect: protectedProcedure
    .input(z.object({ provider: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(Schema.integration)
        .where(
          and(
            eq(Schema.integration.userId, ctx.auth.userId),
            eq(Schema.integration.provider, input.provider),
          ),
        );
      return { success: true };
    }),

  // 7. Sync (Internal use)
  sync: internalProcedure
    .input(
      z.object({
        responseId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.db.query.conversation.findFirst({
        where: eq(Schema.conversation.id, input.responseId),
      });

      if (!response) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      if (!response.finishedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Conversation is not finished",
        });
      }

      // Fetch enabled integrations for this form
      // We need to join with integration table to get tokens
      const formIntegrations = await ctx.db.query.formIntegration.findMany({
        where: and(
          eq(Schema.formIntegration.formId, response.formId),
          eq(Schema.formIntegration.enabled, true),
        ),
        with: {
          integration: true,
        },
      });

      if (!formIntegrations.length) return { success: true, count: 0 };

      const encryptionKey = env.ENCRYPTION_KEY;

      // Build the row from the conversation stored on our side, never from
      // data supplied by the caller.
      const responseData: Record<string, unknown> = {};
      for (const field of response.formFieldResponses) {
        responseData[field.fieldName] = field.fieldValue;
      }
      for (const [key, value] of Object.entries(response.metaData ?? {})) {
        responseData[`meta_${key}`] = value;
      }
      responseData.id = response.id;
      responseData.createdAt = response.createdAt.toISOString();

      let processed = 0;

      // Fetch form details for context
      const form = await ctx.db.query.form.findFirst({
        where: eq(Schema.form.id, response.formId),
        columns: {
          id: true,
          name: true,
        },
      });

      if (!form) return { success: false, error: "Form not found" };

      for (const fi of formIntegrations) {
        try {
          const integration = fi.integration;
          if (integration.provider === "google_sheets") {
            const accessToken = await decrypt(
              integration.encryptedAccessToken,
              encryptionKey,
            );
            const refreshToken = integration.encryptedRefreshToken
              ? await decrypt(integration.encryptedRefreshToken, encryptionKey)
              : undefined;

            const { clientId, clientSecret, redirectUri } =
              getGoogleCredentials();

            const provider = new GoogleSheetsProvider(
              clientId,
              clientSecret,
              redirectUri,
            );

            const newConfig = await provider.onResponse(
              responseData,
              fi.config as any,
              { accessToken, refreshToken },
              { formId: form.id, formName: form.name },
            );

            if (newConfig) {
              await ctx.db
                .update(Schema.formIntegration)
                .set({ config: newConfig })
                .where(eq(Schema.formIntegration.id, fi.id));
            }
            processed++;
          }
        } catch (error) {
          console.error(
            `Failed to process integration ${fi.integration.provider}`,
            error,
          );
        }
      }

      return { success: true, processed };
    }),
});
