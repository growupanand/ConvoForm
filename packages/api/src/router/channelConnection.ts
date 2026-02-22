import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { encrypt } from "@convoform/common";
import { Schema } from "@convoform/db";
import { and, eq, isNull, or } from "drizzle-orm";
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
   * List all channel connections for the current organization.
   * Includes the associated form name (if assigned) for display.
   *
   * @example
   * ```ts
   * const connections = await trpc.channelConnection.listForOrg.query();
   * // => [{ id: "conn_1", channelType: "telegram", enabled: true, form: { id: "form_abc", name: "My Form" } | null, ... }]
   * ```
   */
  listForOrg: orgProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.channelConnection.findMany({
      where: eq(Schema.channelConnection.organizationId, ctx.orgId),
      with: {
        form: {
          columns: { id: true, name: true },
        },
      },
    });
  }),

  /**
   * List bots available to assign to a form: unassigned bots + bots already on this form.
   *
   * @example
   * ```ts
   * const bots = await trpc.channelConnection.listAvailableForForm.query({ formId: "form_abc" });
   * // => [{ id: "conn_1", channelIdentifier: "123456", formId: null, ... }, ...]
   * ```
   */
  listAvailableForForm: orgProtectedProcedure
    .input(z.object({ formId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.channelConnection.findMany({
        where: and(
          eq(Schema.channelConnection.organizationId, ctx.orgId),
          or(
            isNull(Schema.channelConnection.formId),
            eq(Schema.channelConnection.formId, input.formId),
          ),
        ),
      });
    }),

  /**
   * List all forms belonging to the current organization.
   * Used by the org-level channels page to populate form assignment dropdowns.
   *
   * @example
   * ```ts
   * const forms = await trpc.channelConnection.listOrgForms.query();
   * // => [{ id: "form_abc", name: "Contact Form" }, { id: "form_def", name: "Survey" }]
   * ```
   */
  listOrgForms: orgProtectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.form.findMany({
      where: eq(Schema.form.organizationId, ctx.orgId),
      columns: { id: true, name: true },
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
   * Create a new channel connection (bot). `formId` is optional — if omitted,
   * the bot is created unassigned and can be assigned to a form later.
   *
   * Auto-generates a secretToken, encrypts the bot token,
   * and registers the webhook with Telegram via channels-server.
   * The webhook URL uses the bot ID (channelIdentifier) as the stable key.
   *
   * @example
   * ```ts
   * // Create unassigned bot
   * const bot = await trpc.channelConnection.create.mutate({
   *   channelType: "telegram",
   *   channelConfig: { botToken: "123456:ABC-DEF..." },
   * });
   *
   * // Create and immediately assign to a form
   * const bot = await trpc.channelConnection.create.mutate({
   *   formId: "form_abc",
   *   channelType: "telegram",
   *   channelConfig: { botToken: "123456:ABC-DEF..." },
   * });
   * ```
   */
  create: orgProtectedProcedure
    .input(
      z.object({
        formId: z.string().min(1).optional(),
        channelType: channelTypeEnum,
        channelConfig: telegramConfigSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If formId is provided, verify the form belongs to the org
      if (input.formId) {
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

        // Check no other bot of same type is already assigned to this form
        const formBot = await ctx.db.query.channelConnection.findFirst({
          where: and(
            eq(Schema.channelConnection.formId, input.formId),
            eq(Schema.channelConnection.channelType, input.channelType),
          ),
        });

        if (formBot) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `A ${input.channelType} bot is already assigned to this form. Unassign it first.`,
          });
        }
      }

      // Extract bot ID — the unique constraint on channelIdentifier
      // will prevent duplicates at DB level
      const botId = extractBotId(input.channelConfig.botToken);

      // Encrypt bot token and generate secret token
      const secretToken = generateSecretToken();
      const encryptedBotToken = await encrypt(
        input.channelConfig.botToken,
        env.ENCRYPTION_KEY,
      );

      // Build webhook URL using bot ID (stable across form switches)
      const channelsServerUrl =
        env.CHANNELS_SERVER_URL ?? "http://localhost:4001";
      const webhookUrl = `${channelsServerUrl}/webhook/telegram/${botId}`;

      const [connection] = await ctx.db
        .insert(Schema.channelConnection)
        .values({
          formId: input.formId ?? null,
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
            channelIdentifier: botId,
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
   * Assign (or switch) a bot to a form. If the bot was previously on a
   * different form, it's moved. No webhook changes needed since the
   * webhook URL is keyed by bot ID, not form ID.
   *
   * @example
   * ```ts
   * await trpc.channelConnection.assignForm.mutate({
   *   id: "conn_1",
   *   formId: "form_abc",
   * });
   * ```
   */
  assignForm: orgProtectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        formId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify bot belongs to org
      const bot = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.id, input.id),
          eq(Schema.channelConnection.organizationId, ctx.orgId),
        ),
      });

      if (!bot) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bot not found",
        });
      }

      // Verify target form belongs to org
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

      // Check no other bot of same type is already assigned to this form
      const existingBot = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.formId, input.formId),
          eq(Schema.channelConnection.channelType, bot.channelType),
        ),
      });

      if (existingBot && existingBot.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A ${bot.channelType} bot is already assigned to this form. Unassign it first.`,
        });
      }

      const [updated] = await ctx.db
        .update(Schema.channelConnection)
        .set({ formId: input.formId, updatedAt: new Date() })
        .where(eq(Schema.channelConnection.id, input.id))
        .returning();

      return updated;
    }),

  /**
   * Unassign a bot from its current form (set `formId = null`).
   * The bot and its webhook remain active — incoming messages will get
   * a "not connected to any form" response.
   *
   * @example
   * ```ts
   * await trpc.channelConnection.unassignForm.mutate({ id: "conn_1" });
   * ```
   */
  unassignForm: orgProtectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const bot = await ctx.db.query.channelConnection.findFirst({
        where: and(
          eq(Schema.channelConnection.id, input.id),
          eq(Schema.channelConnection.organizationId, ctx.orgId),
        ),
      });

      if (!bot) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bot not found",
        });
      }

      const [updated] = await ctx.db
        .update(Schema.channelConnection)
        .set({ formId: null, updatedAt: new Date() })
        .where(eq(Schema.channelConnection.id, input.id))
        .returning();

      return updated;
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

      // When toggling enabled for a Telegram channel, deregister/re-register
      // the webhook so Telegram stops/starts sending updates accordingly.
      if (
        input.enabled !== undefined &&
        existing.channelType === "telegram" &&
        input.enabled !== existing.enabled
      ) {
        const channelsServerUrl =
          env.CHANNELS_SERVER_URL ?? "http://localhost:4001";
        try {
          if (input.enabled) {
            // Re-enabling → re-register webhook
            await fetch(`${channelsServerUrl}/setup/telegram`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                channelIdentifier: existing.channelIdentifier,
                webhookBaseUrl: channelsServerUrl,
              }),
            });
          } else {
            // Disabling → deregister webhook
            await fetch(`${channelsServerUrl}/teardown/telegram`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                channelIdentifier: existing.channelIdentifier,
              }),
            });
          }
        } catch (err) {
          console.error("[channelConnection] Webhook toggle error:", err);
        }
      }

      return updated;
    }),

  /**
   * Delete a channel connection (bot).
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
            body: JSON.stringify({
              channelIdentifier: existing.channelIdentifier,
            }),
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
