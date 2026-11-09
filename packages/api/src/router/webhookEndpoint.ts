import { analytics } from "@convoform/analytics";
import {
  assertSafeWebhookUrl,
  encrypt,
  generateWebhookSecret,
} from "@convoform/common";
import { and, count, desc, eq, isNull } from "@convoform/db";
import {
  conversation,
  form,
  webhookDelivery,
  webhookEndpoint,
} from "@convoform/db/src/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { deliverWebhook } from "../actions/webhook/deliverWebhook";
import { env } from "../env";
import { orgProtectedProcedure } from "../procedures/orgProtectedProcedure";
import { createTRPCRouter } from "../trpc";
import type { ActionContext } from "../types/actionContextType";

type OrgActionContext = ActionContext & { orgId: string };

const MAX_ENABLED_ENDPOINTS_PER_FORM = 10;
const DEFAULT_DELIVERY_PAGE_SIZE = 10;
const MAX_DELIVERY_PAGE_SIZE = 50;

const formIdInput = z.object({ formId: z.string().min(1) });
const endpointIdInput = z.object({ id: z.string().min(1) });

/**
 * A form-scoped webhook endpoint belongs to the organization that owns the
 * form. Every endpoint procedure goes through this check before touching data.
 */
async function assertFormBelongsToOrg(ctx: OrgActionContext, formId: string) {
  const ownedForm = await ctx.db.query.form.findFirst({
    where: and(eq(form.id, formId), eq(form.organizationId, ctx.orgId)),
    columns: { id: true },
  });

  if (!ownedForm) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Form not found",
    });
  }
}

async function getEndpointForOrg(ctx: OrgActionContext, endpointId: string) {
  const endpoint = await ctx.db.query.webhookEndpoint.findFirst({
    where: and(
      eq(webhookEndpoint.id, endpointId),
      eq(webhookEndpoint.organizationId, ctx.orgId),
    ),
  });

  if (!endpoint) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Webhook endpoint not found",
    });
  }

  return endpoint;
}

function withoutSecret<T extends object>(endpoint: T) {
  const { encryptedSecret: _encryptedSecret, ...publicEndpoint } =
    endpoint as T & { encryptedSecret?: string };
  return publicEndpoint;
}

export const webhookEndpointRouter = createTRPCRouter({
  /**
   * Create an endpoint and return the plaintext signing secret exactly once.
   * Only the encrypted secret is stored.
   */
  create: orgProtectedProcedure
    .input(
      formIdInput.extend({
        url: z.string().trim().min(1).max(2048),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertFormBelongsToOrg(ctx, input.formId);

      const countRows = await ctx.db
        .select({ value: count() })
        .from(webhookEndpoint)
        .where(
          and(
            eq(webhookEndpoint.formId, input.formId),
            eq(webhookEndpoint.enabled, true),
            isNull(webhookEndpoint.disabledAt),
          ),
        );

      const enabledCount = countRows[0]?.value ?? 0;

      if (enabledCount >= MAX_ENABLED_ENDPOINTS_PER_FORM) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `A form can have at most ${MAX_ENABLED_ENDPOINTS_PER_FORM} enabled webhook endpoints`,
        });
      }

      let safeUrl: URL;
      try {
        safeUrl = await assertSafeWebhookUrl(input.url);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Webhook URL is not safe",
        });
      }

      const secret = generateWebhookSecret();
      const encryptedSecret = await encrypt(secret, env.ENCRYPTION_KEY);

      const [endpoint] = await ctx.db
        .insert(webhookEndpoint)
        .values({
          formId: input.formId,
          organizationId: ctx.orgId,
          url: safeUrl.toString(),
          encryptedSecret,
        })
        .returning();

      if (!endpoint) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create webhook endpoint",
        });
      }

      return {
        endpoint: withoutSecret(endpoint),
        secret,
      };
    }),

  list: orgProtectedProcedure
    .input(formIdInput)
    .query(async ({ ctx, input }) => {
      await assertFormBelongsToOrg(ctx, input.formId);

      const endpoints = await ctx.db.query.webhookEndpoint.findMany({
        where: eq(webhookEndpoint.formId, input.formId),
        columns: {
          encryptedSecret: false,
        },
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      });

      return endpoints.map(withoutSecret);
    }),

  /**
   * Rotate the signing secret. The new secret is shown once; old signatures
   * stop verifying immediately.
   */
  rotateSecret: orgProtectedProcedure
    .input(endpointIdInput)
    .mutation(async ({ ctx, input }) => {
      await getEndpointForOrg(ctx, input.id);

      const secret = generateWebhookSecret();
      const encryptedSecret = await encrypt(secret, env.ENCRYPTION_KEY);

      await ctx.db
        .update(webhookEndpoint)
        .set({ encryptedSecret, updatedAt: new Date() })
        .where(eq(webhookEndpoint.id, input.id));

      return { secret };
    }),

  /**
   * Toggle an endpoint. Re-enabling clears the auto-disable state and the
   * consecutive failure counter, as promised in the settings UI.
   */
  setEnabled: orgProtectedProcedure
    .input(
      endpointIdInput.extend({
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await getEndpointForOrg(ctx, input.id);

      await ctx.db
        .update(webhookEndpoint)
        .set({
          enabled: input.enabled,
          ...(input.enabled
            ? {
                consecutiveFailures: 0,
                disabledAt: null,
                disabledReason: null,
              }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(webhookEndpoint.id, input.id));

      return { success: true };
    }),

  delete: orgProtectedProcedure
    .input(endpointIdInput)
    .mutation(async ({ ctx, input }) => {
      await getEndpointForOrg(ctx, input.id);

      await ctx.db
        .delete(webhookEndpoint)
        .where(eq(webhookEndpoint.id, input.id));

      return { success: true };
    }),

  /**
   * Queue a test delivery with a sample payload. It shows up in the delivery
   * log but never counts toward the endpoint failure counter.
   */
  sendTest: orgProtectedProcedure
    .input(endpointIdInput)
    .mutation(async ({ ctx, input }) => {
      const endpoint = await getEndpointForOrg(ctx, input.id);

      if (!endpoint.enabled || endpoint.disabledAt) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Enable the endpoint before sending a test delivery",
        });
      }

      const [delivery] = await ctx.db
        .insert(webhookDelivery)
        .values({
          endpointId: endpoint.id,
          organizationId: ctx.orgId,
          conversationId: null,
          eventType: "response.completed",
          isTest: true,
        })
        .returning({ id: webhookDelivery.id });

      if (!delivery) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create test webhook delivery",
        });
      }

      void deliverWebhook(delivery.id, { db: ctx.db }).catch(
        async (error: unknown) => {
          console.error(
            `Failed to dispatch test webhook delivery ${delivery.id}`,
            error,
          );
          try {
            await analytics.captureException(
              error instanceof Error ? error : new Error(String(error)),
              delivery.id,
            );
          } catch {
            // A test delivery must never fail the settings request.
          }
        },
      );

      return { deliveryId: delivery.id };
    }),

  /**
   * Webhook deliveries for one conversation, with the endpoint each delivery
   * belongs to. Powers the journey strip on the conversation detail page.
   *
   * The conversation is the ownership boundary: a conversation belongs to one
   * organization, so checking it once scopes both the endpoints and deliveries.
   */
  deliveriesForConversation: orgProtectedProcedure
    .input(
      z.object({
        conversationId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ownedConversation = await ctx.db.query.conversation.findFirst({
        where: and(
          eq(conversation.id, input.conversationId),
          eq(conversation.organizationId, ctx.orgId),
        ),
        columns: {
          id: true,
          formId: true,
        },
      });

      if (!ownedConversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const [endpoints, deliveries] = await Promise.all([
        ctx.db.query.webhookEndpoint.findMany({
          where: eq(webhookEndpoint.formId, ownedConversation.formId),
          columns: {
            id: true,
            url: true,
            enabled: true,
            disabledAt: true,
          },
          orderBy: (table, { desc }) => [desc(table.createdAt)],
        }),
        ctx.db
          .select({
            id: webhookDelivery.id,
            endpointId: webhookDelivery.endpointId,
            endpointUrl: webhookEndpoint.url,
            status: webhookDelivery.status,
            attempts: webhookDelivery.attempts,
            lastStatusCode: webhookDelivery.lastStatusCode,
            lastLatencyMs: webhookDelivery.lastLatencyMs,
            lastError: webhookDelivery.lastError,
            deliveredAt: webhookDelivery.deliveredAt,
            createdAt: webhookDelivery.createdAt,
            updatedAt: webhookDelivery.updatedAt,
          })
          .from(webhookDelivery)
          .innerJoin(
            webhookEndpoint,
            eq(webhookDelivery.endpointId, webhookEndpoint.id),
          )
          .where(
            and(
              eq(webhookDelivery.conversationId, input.conversationId),
              eq(webhookDelivery.organizationId, ctx.orgId),
              eq(webhookDelivery.isTest, false),
            ),
          )
          .orderBy(desc(webhookDelivery.createdAt), desc(webhookDelivery.id)),
      ]);

      return { endpoints, deliveries };
    }),

  /**
   * Paginated delivery log for one endpoint, newest first.
   */
  deliveries: orgProtectedProcedure
    .input(
      endpointIdInput.extend({
        page: z.number().int().min(1).default(1),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(MAX_DELIVERY_PAGE_SIZE)
          .default(DEFAULT_DELIVERY_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      await getEndpointForOrg(ctx, input.id);

      const where = eq(webhookDelivery.endpointId, input.id);
      const offset = (input.page - 1) * input.pageSize;

      const [items, totalRows] = await Promise.all([
        ctx.db
          .select({
            id: webhookDelivery.id,
            conversationId: webhookDelivery.conversationId,
            eventType: webhookDelivery.eventType,
            isTest: webhookDelivery.isTest,
            status: webhookDelivery.status,
            attempts: webhookDelivery.attempts,
            lastStatusCode: webhookDelivery.lastStatusCode,
            lastLatencyMs: webhookDelivery.lastLatencyMs,
            lastError: webhookDelivery.lastError,
            deliveredAt: webhookDelivery.deliveredAt,
            createdAt: webhookDelivery.createdAt,
          })
          .from(webhookDelivery)
          .where(where)
          .orderBy(desc(webhookDelivery.createdAt), desc(webhookDelivery.id))
          .limit(input.pageSize)
          .offset(offset),
        ctx.db.select({ value: count() }).from(webhookDelivery).where(where),
      ]);

      const total = totalRows[0]?.value ?? 0;

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.max(1, Math.ceil(total / input.pageSize)),
      };
    }),
});
