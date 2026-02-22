/**
 * ============================================
 * ------------ DB OPERATIONS -----------------
 * ============================================
 *
 * Implements the ConversationOperations interface for the channels server.
 * Wraps @convoform/api actions to provide conversation CRUD operations
 * and channel connection lookups.
 */

import {
  createConversation as apiCreateConversation,
  getOneConversation,
  patchConversation,
} from "@convoform/api/src/actions/conversation";
import { getOneFormWithFields } from "@convoform/api/src/actions/form";
import type { ConversationOperations } from "@convoform/channels";
import { db } from "@convoform/db";
import {
  type CoreConversation,
  coreConversationSchema,
} from "@convoform/db/src/schema";

/**
 * Build the ConversationOperations needed by ChannelConversationHandler.
 *
 * These operations handle creating, fetching, and updating conversations
 * in the database, with channel-specific metadata attached.
 *
 * @example
 * ```ts
 * const ops = buildConversationOperations();
 * const handler = new ChannelConversationHandler(sessionManager);
 * const response = await handler.handleMessage(message, {
 *   formId: "form_abc",
 *   operations: ops,
 * });
 * ```
 */
export function buildConversationOperations(): ConversationOperations {
  return {
    getConversation: async (
      conversationId: string,
    ): Promise<CoreConversation> => {
      const conv = await getOneConversation(conversationId, { db });
      if (!conv) {
        throw new Error(`Conversation not found: ${conversationId}`);
      }

      // Fetch the form to build the full CoreConversation
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
      channelInfo: { channelType: string; channelSenderId: string },
    ): Promise<CoreConversation> => {
      const formWithFields = await getOneFormWithFields(formId, { db });
      if (!formWithFields) {
        throw new Error(`Form not found: ${formId}`);
      }

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
  };
}

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
}

/**
 * Look up a channel connection for a given form and channel type.
 *
 * @param formId - The form ID to look up
 * @param channelType - The channel type (e.g., "telegram")
 * @returns The channel connection record, or null if not found/disabled
 *
 * @example
 * ```ts
 * const connection = await getChannelConnection("form_abc", "telegram");
 * if (connection) {
 *   const config = connection.channelConfig as TelegramChannelConfig;
 *   console.log("Bot token:", config.botToken);
 * }
 * ```
 */
export async function getChannelConnection(
  formId: string,
  channelType: string,
) {
  const result = await db.query.channelConnection.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.formId, formId),
        eq(table.channelType, channelType),
        eq(table.enabled, true),
      ),
  });

  return result ?? null;
}
