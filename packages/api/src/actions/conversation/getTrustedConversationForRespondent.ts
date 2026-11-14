import {
  type CoreConversation,
  coreConversationSchema,
} from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";
import { getOneFormWithFields } from "../form";
import { getOneConversation } from "./getOneConversation";
import { isFormOrganizationMember } from "./isFormOrganizationMember";

export class ConversationAccessError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "ConversationAccessError";
    this.statusCode = statusCode;
  }
}

type TrustedConversationInput = {
  conversationId: string;
  formId: string;
  /** Only used as a fallback when the saved conversation has no field yet. */
  currentFieldId?: string | null;
};

/**
 * Load the conversation and its form from the database for an "existing"
 * conversation request.
 *
 * Everything security-sensitive comes from the database:
 * - `organizationId` and `formId` are never read from the browser payload
 * - `isOwnerPreview` is derived from Clerk org membership, not the body
 * - finished conversations cannot be continued
 */
export async function getTrustedConversationForRespondent(
  input: TrustedConversationInput,
  clerkUserId: string | null | undefined,
  ctx: ActionContext,
): Promise<{ conversation: CoreConversation; currentFieldId: string }> {
  const existingConversation = await getOneConversation(
    input.conversationId,
    ctx,
  );

  if (!existingConversation) {
    throw new ConversationAccessError("Conversation not found", 404);
  }

  if (existingConversation.formId !== input.formId) {
    throw new ConversationAccessError("Conversation not found", 404);
  }

  if (existingConversation.finishedAt) {
    throw new ConversationAccessError("Conversation already completed", 409);
  }

  const formWithFields = await getOneFormWithFields(
    existingConversation.formId,
    ctx,
  );

  if (!formWithFields) {
    throw new ConversationAccessError("Form not found", 404);
  }

  const isOwnerPreview = await isFormOrganizationMember(
    existingConversation.organizationId,
    clerkUserId,
    ctx,
  );

  const conversation = coreConversationSchema.parse({
    ...existingConversation,
    metaData: {
      ...existingConversation.metaData,
      isOwnerPreview,
    },
    form: formWithFields,
  });

  const currentFieldId =
    existingConversation.currentFieldId ?? input.currentFieldId ?? null;

  if (
    !currentFieldId ||
    !conversation.formFieldResponses.some(
      (field) => field.id === currentFieldId,
    )
  ) {
    throw new ConversationAccessError("Conversation is not ready", 409);
  }

  return { conversation, currentFieldId };
}
