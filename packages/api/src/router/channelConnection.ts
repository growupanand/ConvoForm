import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { encrypt } from "@convoform/common";
import { Schema } from "@convoform/db";
import { and, eq } from "drizzle-orm";
import { env } from "../env";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";

/**
 * Generate a random secret token for Telegram webhook verification.
 *
 * @example
 * ```ts
 * const token = generateSecretToken();
 * // => "a1b2c3d4e5f6..."
 * ```
 */
function generateSecretToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Extract the bot ID from a Telegram bot token.
 * Telegram tokens have the format `{bot_id}:{hash}`, e.g. `123456:ABC-DEF...`.
 * The bot_id is a non-sensitive numeric identifier.
 *
 * @example
 * ```ts
 * extractBotId("123456789:ABCdefGHI-jklMNO")
 * // => "123456789"
 * ```
 */
function extractBotId(botToken: string): string {
  const colonIndex = botToken.indexOf(":");
  if (colonIndex === -1) {
    return botToken; // Fallback: use whole token if format unexpected
  }
  return botToken.substring(0, colonIndex);
}

const telegramConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
});

const channelTypeEnum = z.enum(["telegram"]);

export const channelConnectionRouter = createTRPCRouter({
  /**
   * List all channel connections for a specific form.
   *
   * @example
   * ```ts
   * const connections = await trpc.channelConnection.listForForm.query({ formId: "form_abc" });
   * // => [{ id: "conn_1", channelType: "telegram", enabled: true, ... }]
   * ```
   */
  listForForm: orgProtectedProcedure
    .input(z.object({ formId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Verify form belongs to the org
      const form = await ctx.db.query.form.findFirst({
        where: and(
          eq(Schema.form.id, input.formId),
          eq(Schema.form.organizationId, ctx.orgId),
        ),
        columns: { id: true },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      return await ctx.db.query.channelConnection.findMany({
        where: eq(Schema.channelConnection.formId, input.formId),
      });
    }),

  /**
   * Get a single channel connection by ID.
   *
   * @example
   * ```ts
   * const conn = await trpc.channelConnection.getOne.query({ id: "conn_1" });
   * ```
   */
  getOne: orgProtectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const connection = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.id, input.id),
          eq(Schema.channelConnection.organizationId, ctx.orgId),
        ),
      });

      if (!connection) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel connection not found",
        });
      }

      return connection;
    }),

  /**
   * Create a new channel connection for a form.
   *
   * Auto-generates a secretToken, encrypts the bot token,
   * and registers the webhook with Telegram via channels-server.
   * The resulting webhookUrl is stored in channelConfig.
   *
   * @example
   * ```ts
   * const conn = await trpc.channelConnection.create.mutate({
   *   formId: "form_abc",
   *   channelType: "telegram",
   *   channelConfig: { botToken: "123456:ABC-DEF..." },
   * });
   * ```
   */
  create: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1),
        channelType: channelTypeEnum,
        channelConfig: telegramConfigSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify form belongs to the org
      const form = await ctx.db.query.form.findFirst({
        where: and(
          eq(Schema.form.id, input.formId),
          eq(Schema.form.organizationId, ctx.orgId),
        ),
        columns: { id: true },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Check for duplicate (channelType + formId is unique)
      const existing = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.formId, input.formId),
          eq(Schema.channelConnection.channelType, input.channelType),
        ),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A ${input.channelType} connection already exists for this form`,
        });
      }

      // Extract bot ID and check if this bot is already used by another form
      const botId = extractBotId(input.channelConfig.botToken);
      const botInUse = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.channelType, input.channelType),
          eq(Schema.channelConnection.channelIdentifier, botId),
        ),
      });

      if (botInUse) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This Telegram bot is already connected to another form. Each bot can only be linked to one form.",
        });
      }

      // Encrypt bot token and generate secret token
      const secretToken = generateSecretToken();
      const encryptedBotToken = await encrypt(
        input.channelConfig.botToken,
        env.ENCRYPTION_KEY,
      );

      // Build webhook URL from the known channels-server URL
      const channelsServerUrl =
        env.CHANNELS_SERVER_URL ?? "http://localhost:4001";
      const webhookUrl = `${channelsServerUrl}/webhook/telegram/${input.formId}`;

      const [connection] = await ctx.db
        .insert(Schema.channelConnection)
        .values({
          formId: input.formId,
          channelType: input.channelType,
          channelConfig: {
            botToken: encryptedBotToken,
            secretToken,
            webhookUrl,
          },
          enabled: true,
          organizationId: ctx.orgId,
          channelIdentifier: botId,
        })
        .returning();

      if (!connection) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create channel connection",
        });
      }

      // Auto-register webhook with Telegram via channels-server
      try {
        const response = await fetch(`${channelsServerUrl}/setup/telegram`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formId: input.formId,
            webhookBaseUrl: channelsServerUrl,
          }),
        });

        if (!response.ok) {
          console.error(
            "[channelConnection] Webhook auto-setup failed:",
            await response.text(),
          );
        }
      } catch (err) {
        // Don't fail the create if webhook setup fails — the connection
        // is saved and webhook can be re-triggered by toggling enabled.
        console.error("[channelConnection] Webhook auto-setup error:", err);
      }

      return connection;
    }),

  /**
   * Update a channel connection (toggle enabled, update config).
   *
   * @example
   * ```ts
   * await trpc.channelConnection.update.mutate({
   *   id: "conn_1",
   *   enabled: false,
   * });
   * ```
   */
  update: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        enabled: z.boolean().optional(),
        channelConfig: telegramConfigSchema.partial().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify connection belongs to org
      const existing = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.id, input.id),
          eq(Schema.channelConnection.organizationId, ctx.orgId),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel connection not found",
        });
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (input.enabled !== undefined) {
        updateData.enabled = input.enabled;
      }

      // If bot token is being updated, encrypt the new token
      if (input.channelConfig?.botToken) {
        const encryptedBotToken = await encrypt(
          input.channelConfig.botToken,
          env.ENCRYPTION_KEY,
        );
        updateData.channelConfig = {
          ...(existing.channelConfig as object),
          botToken: encryptedBotToken,
        };
      }

      const [updated] = await ctx.db
        .update(Schema.channelConnection)
        .set(updateData)
        .where(eq(Schema.channelConnection.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Delete a channel connection.
   *
   * Deregisters the webhook from Telegram, clears the adapter cache,
   * and removes the DB record.
   *
   * @example
   * ```ts
   * await trpc.channelConnection.delete.mutate({ id: "conn_1" });
   * ```
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Verify connection belongs to org
      const existing = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.id, input.id),
          eq(Schema.channelConnection.organizationId, ctx.orgId),
        ),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Channel connection not found",
        });
      }

      // Deregister webhook from Telegram and clear adapter cache
      if (existing.channelType === "telegram") {
        const channelsServerUrl =
          env.CHANNELS_SERVER_URL ?? "http://localhost:4001";
        try {
          await fetch(`${channelsServerUrl}/teardown/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ formId: existing.formId }),
          });
        } catch (err) {
          console.error("[channelConnection] Webhook teardown error:", err);
        }
      }

      await ctx.db
        .delete(Schema.channelConnection)
        .where(eq(Schema.channelConnection.id, input.id));

      return { success: true };
    }),
});
