import { analytics } from "@convoform/analytics";
import { eq } from "@convoform/db";
import {
  insertOrganizationMemberSchema,
  insertOrganizationSchema,
  insertUserSchema,
  organization,
  organizationMember,
  user,
} from "@convoform/db/src/schema";
import { z } from "zod/v4";

import type { ActionContext } from "../../types/actionContextType";

const userCreatedInputSchema = insertUserSchema.extend({
  signupMethod: z.string().optional(),
});

const userDeletedInputSchema = z.object({
  userId: z.string(),
});

const organizationCreatedInputSchema = insertOrganizationSchema.extend({
  createdByClerkUserId: z.string().optional(),
});

const organizationDeletedInputSchema = z.object({
  organizationId: z.string(),
});

const organizationMembershipCreatedInputSchema = insertOrganizationMemberSchema;

const organizationMembershipDeletedInputSchema = z.object({
  membershipId: z.string(),
});

export type UserCreatedInput = z.infer<typeof userCreatedInputSchema>;
export type UserDeletedInput = z.infer<typeof userDeletedInputSchema>;
export type OrganizationCreatedInput = z.infer<
  typeof organizationCreatedInputSchema
>;
export type OrganizationDeletedInput = z.infer<
  typeof organizationDeletedInputSchema
>;
export type OrganizationMembershipCreatedInput = z.infer<
  typeof organizationMembershipCreatedInputSchema
>;
export type OrganizationMembershipDeletedInput = z.infer<
  typeof organizationMembershipDeletedInputSchema
>;

/**
 * Clerk webhook handlers.
 *
 * These are plain server functions, not tRPC procedures: they must only be
 * called from the Clerk webhook route after the Svix signature has been
 * verified. Never mount them on the public app router.
 */
export async function handleUserCreated(
  input: UserCreatedInput,
  ctx: ActionContext,
) {
  const { signupMethod, ...userInput } = userCreatedInputSchema.parse(input);
  try {
    const [newUser] = await ctx.db.insert(user).values(userInput).returning();

    await analytics.track("user:create", {
      distinctId: newUser?.userId,
      properties: {
        ...newUser,
        method: signupMethod,
      },
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to save user data",
      { userId: userInput.userId },
      e,
    );
    throw e;
  }
}

export async function handleUserDeleted(
  input: UserDeletedInput,
  ctx: ActionContext,
) {
  const parsedInput = userDeletedInputSchema.parse(input);
  try {
    const [deletedUser] = await ctx.db
      .delete(user)
      .where(eq(user.userId, parsedInput.userId))
      .returning();
    await analytics.track("user:delete", {
      distinctId: deletedUser?.userId,
      properties: deletedUser,
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to delete user data",
      { userId: parsedInput.userId },
      e,
    );
    throw e;
  }
}

export async function handleOrganizationCreated(
  input: OrganizationCreatedInput,
  ctx: ActionContext,
) {
  const { createdByClerkUserId, ...organizationInput } =
    organizationCreatedInputSchema.parse(input);
  try {
    const [existingOrganization] = await ctx.db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.organizationId, organizationInput.organizationId))
      .limit(1);

    if (existingOrganization) {
      return;
    }

    const [data] = await ctx.db
      .insert(organization)
      .values(organizationInput)
      .returning();
    await analytics.track("organization:create", {
      distinctId: createdByClerkUserId,
      properties: data,
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to save organization data",
      { organizationId: organizationInput.organizationId },
      e,
    );
    throw e;
  }
}

export async function handleOrganizationDeleted(
  input: OrganizationDeletedInput,
  ctx: ActionContext,
) {
  const parsedInput = organizationDeletedInputSchema.parse(input);
  try {
    // delete memberships between the users and the organization
    await ctx.db
      .delete(organizationMember)
      .where(eq(organizationMember.organizationId, parsedInput.organizationId));

    // TODO(#557): also delete AiProviderCredential and OrganizationAiSettings
    // rows once #556 lands.

    // delete the organization
    const [data] = await ctx.db
      .delete(organization)
      .where(eq(organization.organizationId, parsedInput.organizationId))
      .returning();
    await analytics.track("organization:delete", {
      properties: data,
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to save organization data",
      { organizationId: parsedInput.organizationId },
      e,
    );
    throw e;
  }
}

export async function handleOrganizationMembershipCreated(
  input: OrganizationMembershipCreatedInput,
  ctx: ActionContext,
) {
  const parsedInput = organizationMembershipCreatedInputSchema.parse(input);
  try {
    const [existingMember] = await ctx.db
      .select({ id: organizationMember.id })
      .from(organizationMember)
      .where(eq(organizationMember.memberId, parsedInput.memberId))
      .limit(1);

    if (existingMember) {
      return;
    }

    const [data] = await ctx.db
      .insert(organizationMember)
      .values(parsedInput)
      .returning();
    await analytics.track("organizationMember:create", {
      distinctId: data?.userId,
      properties: data,
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to save organization data",
      { memberId: parsedInput.memberId },
      e,
    );
    throw e;
  }
}

export async function handleOrganizationMembershipDeleted(
  input: OrganizationMembershipDeletedInput,
  ctx: ActionContext,
) {
  const parsedInput = organizationMembershipDeletedInputSchema.parse(input);
  try {
    const [data] = await ctx.db
      .delete(organizationMember)
      .where(eq(organizationMember.memberId, parsedInput.membershipId))
      .returning();

    await analytics.track("organizationMember:delete", {
      distinctId: data?.userId,
      properties: data,
    });
  } catch (e) {
    if (isDuplicateKeyError(e)) {
      return;
    }

    logWebhookError(
      "Webhook event error: Unable to delete organization data",
      { membershipId: parsedInput.membershipId },
      e,
    );
    throw e;
  }
}

function logWebhookError(
  message: string,
  ids: Record<string, string>,
  error: unknown,
) {
  console.error({
    message,
    ...ids,
    errorMessage: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Clerk retries webhooks on non-2xx responses. Duplicate rows are expected when
 * a retry races a previous delivery, so those are safe to acknowledge. Every
 * other failure must bubble up so the route can return 500.
 */
function isDuplicateKeyError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    cause?: unknown;
  };

  if (candidate.code === "23505") {
    return true;
  }

  if (
    typeof candidate.message === "string" &&
    candidate.message.includes("duplicate key value")
  ) {
    return true;
  }

  if (candidate.cause && candidate.cause !== error) {
    return isDuplicateKeyError(candidate.cause);
  }

  return false;
}
