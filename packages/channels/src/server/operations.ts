/**
 * ============================================
 * ----- CHANNEL SERVER OPERATIONS ------------
 * ============================================
 *
 * Defines the operations interface that ChannelServer needs for
 * database access. Extends ConversationOperations with channel
 * connection lookups.
 *
 * Provides a default implementation using @convoform/db and
 * @convoform/api for convenience. Custom implementations can
 * be injected for testing or alternative storage backends.
 */

import {
  createConversation as apiCreateConversation,
  getOneConversation,
  patchConversation,
} from "@convoform/api/src/actions/conversation";
import { getOrganizationFormsCountByFormId } from "@convoform/api/src/actions/conversation/getOrganizationFormsCountByFormId";
import { getOneFormWithFields } from "@convoform/api/src/actions/form";
import {
  FEATURE_NAMES,
  PLAN_IDS,
  getPlanLimit,
  isOverLimit,
} from "@convoform/common";
import { and, db, eq } from "@convoform/db";
import {
  type CoreConversation,
  channelConnection,
  coreConversationSchema,
} from "@convoform/db/src/schema";
import type { ConversationOperations } from "../channel-conversation-handler";

/**
 * Configuration stored in a channel connection's `channelConfig` JSONB column
 * for Telegram channels.
 *
 * @example
 * ```ts
 * const config: TelegramChannelConfig = {
 *   botToken: "123456:ABC-DEF...",
 *   secretToken: "webhook-secret",
 * };
 * ```
 */
export interface TelegramChannelConfig {
  botToken: string;
  secretToken?: string;
  webhookUrl?: string;
}

/**
 * Record shape returned by channel connection lookups.
 */
export interface ChannelConnectionRecord {
  id: string;
  formId: string | null;
  channelType: string;
  channelConfig: unknown;
  channelIdentifier: string | null;
  enabled: boolean;
}

/**
 * Extended operations interface for the ChannelServer.
 * Includes conversation CRUD (from ConversationOperations) plus
 * channel connection lookups needed for webhook handling.
 *
 * @example
 * ```ts
 * const ops = buildChannelServerOperations();
 * const server = new ChannelServer({
 *   sessionManager: new InMemorySessionManager(),
 *   encryptionKey: "...",
 *   operations: ops,
 * });
 * ```
 */
export interface ChannelServerOperations extends ConversationOperations {
  /**
   * Look up a channel connection by its identifier and type.
   * Only returns enabled connections.
   *
   * @param channelIdentifier - The channel identifier (e.g., Telegram bot ID)
   * @param channelType - The channel type (e.g., "telegram")
   * @returns The connection record, or null if not found/disabled
   *
   * @example
   * ```ts
   * const conn = await ops.getChannelConnection("123456789", "telegram");
   * if (conn) {
   *   console.log("Bot assigned to form:", conn.formId);
   * }
   * ```
   */
  getChannelConnection(
    channelIdentifier: string,
    channelType: string,
  ): Promise<ChannelConnectionRecord | null>;

  /**
   * Look up a channel connection regardless of enabled status.
   * Used during teardown when the connection may already be disabled.
   *
   * @param channelIdentifier - The channel identifier (e.g., Telegram bot ID)
   * @param channelType - The channel type (e.g., "telegram")
   * @returns The connection record, or null if not found
   *
   * @example
   * ```ts
   * const conn = await ops.getChannelConnectionForTeardown("123456789", "telegram");
   * if (conn) {
   *   // Deregister webhook using conn.channelConfig
   * }
   * ```
   */
  getChannelConnectionForTeardown(
    channelIdentifier: string,
    channelType: string,
  ): Promise<ChannelConnectionRecord | null>;

  /**
   * Update the configuration of a channel connection.
   *
   * @param channelIdentifier - The channel identifier (e.g., Telegram bot ID)
   * @param channelType - The channel type (e.g., "telegram")
   * @param newConfig - The new configuration to store
   */
  updateChannelConnectionConfig(
    channelIdentifier: string,
    channelType: string,
    newConfig: unknown,
  ): Promise<void>;
}

/**
 * Build the default ChannelServerOperations using @convoform/db.
 *
 * These operations handle creating, fetching, and updating conversations
 * in the database, plus channel connection lookups.
 *
 * @example
 * ```ts
 * const ops = buildChannelServerOperations();
 * const server = new ChannelServer({
 *   sessionManager: new InMemorySessionManager(),
 *   encryptionKey: process.env.ENCRYPTION_KEY,
 *   operations: ops,
 * });
 * ```
 */
export function buildChannelServerOperations(): ChannelServerOperations {
  return {
    getConversation: async (
      conversationId: string,
    ): Promise<CoreConversation> => {
      const conv = await getOneConversation(conversationId, { db });
      if (!conv) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      const formWithFields = await getOneFormWithFields(conv.formId, { db });
      if (!formWithFields) {
        throw new Error(`Form not found for conversation: ${conv.formId}`);
      }

      return coreConversationSchema.parse({
        ...conv,
        form: formWithFields,
      });
    },

    createConversation: async (
      formId: string,
      channelInfo: {
        channelType: string;
        channelSenderId: string;
        metadata?: Record<string, unknown>;
      },
    ): Promise<CoreConversation> => {
      const formWithFields = await getOneFormWithFields(formId, { db });
      if (!formWithFields) {
        throw new Error(`Form not found: ${formId}`);
      }

      // Check form submission limits (same as web app route.ts)
      await checkFormSubmissionLimit(formWithFields.id);

      const fieldsWithEmptyData = formWithFields.formFields.map((field) => ({
        id: field.id,
        fieldName: field.fieldName,
        fieldDescription: field.fieldDescription,
        fieldValue: null,
        fieldConfiguration: field.fieldConfiguration,
      }));

      const conversationData = await apiCreateConversation(
        {
          formId: formWithFields.id,
          name: `${channelInfo.channelType} conversation`,
          organizationId: formWithFields.organizationId,
          transcript: [],
          formFieldResponses: fieldsWithEmptyData,
          formOverview: formWithFields.overview,
          channelType: channelInfo.channelType,
          channelSenderId: channelInfo.channelSenderId,
          metaData: {
            channel: channelInfo.metadata as Record<string, unknown>,
          },
        },
        { db },
      );

      return coreConversationSchema.parse({
        ...conversationData,
        form: formWithFields,
      });
    },

    updateConversation: async (
      conversation: CoreConversation,
    ): Promise<void> => {
      await patchConversation(conversation, { db });
    },

    getChannelConnection: async (
      channelIdentifier: string,
      channelType: string,
    ): Promise<ChannelConnectionRecord | null> => {
      const result = await db.query.channelConnection.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.channelIdentifier, channelIdentifier),
            eq(table.channelType, channelType),
            eq(table.enabled, true),
          ),
      });

      return (result as ChannelConnectionRecord) ?? null;
    },

    getChannelConnectionForTeardown: async (
      channelIdentifier: string,
      channelType: string,
    ): Promise<ChannelConnectionRecord | null> => {
      const result = await db.query.channelConnection.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.channelIdentifier, channelIdentifier),
            eq(table.channelType, channelType),
          ),
      });

      return (result as ChannelConnectionRecord) ?? null;
    },

    updateChannelConnectionConfig: async (
      channelIdentifier: string,
      channelType: string,
      newConfig: unknown,
    ): Promise<void> => {
      await db
        .update(channelConnection)
        .set({ channelConfig: newConfig as Record<string, unknown> })
        .where(
          and(
            eq(channelConnection.channelIdentifier, channelIdentifier),
            eq(channelConnection.channelType, channelType),
          ),
        );
    },
  };
}

/**
 * Check if the form's organization has exceeded its submission limit.
 * Mirrors the web app's `checkNThrowErrorFormSubmissionLimit` logic.
 *
 * @param formId - The form ID to check limits for
 * @throws Error if submissions exceed the plan limit
 *
 * @example
 * ```ts
 * await checkFormSubmissionLimit("form_abc");
 * // Throws if limit exceeded: "Form submissions limit exceeded. Maximum 100 responses allowed."
 * ```
 */
async function checkFormSubmissionLimit(formId: string): Promise<void> {
  // No limit for demo form or development
  if (formId === "demo" || process.env.NODE_ENV === "development") {
    return;
  }

  const totalSubmissionsCount = await getOrganizationFormsCountByFormId(
    formId,
    { db },
  );

  if (!totalSubmissionsCount) {
    console.error("Unable to get total submissions count", { formId });
    return;
  }

  if (
    isOverLimit(
      totalSubmissionsCount,
      PLAN_IDS.FREE, // TODO: Replace with actual user's plan ID
      FEATURE_NAMES.FORM_RESPONSES,
    )
  ) {
    const limit = getPlanLimit(PLAN_IDS.FREE, FEATURE_NAMES.FORM_RESPONSES);
    throw new Error(
      `Form submissions limit exceeded. Maximum ${limit} responses allowed.`,
      {
        cause: {
          statusCode: 403,
        },
      },
    );
  }
}
