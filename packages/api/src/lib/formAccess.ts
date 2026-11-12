import { and, eq } from "@convoform/db";
import { form } from "@convoform/db/src/schema";
import { TRPCError } from "@trpc/server";
import type { ActionContext } from "../types/actionContextType";

type OrgContext = { orgId: string };

/**
 * Restricts a form query to a form that belongs to the caller's organization.
 * Use this in every `where` clause that targets a form by id.
 */
export function formOrgWhere(ctx: OrgContext, formId: string) {
  return and(eq(form.id, formId), eq(form.organizationId, ctx.orgId));
}

export function formNotFoundError() {
  return new TRPCError({
    code: "NOT_FOUND",
    message: "Form not found",
  });
}

/**
 * Throws `NOT_FOUND` instead of revealing whether a form exists in another
 * organization.
 */
export async function assertFormInOrg(
  ctx: ActionContext & OrgContext,
  formId: string,
) {
  const ownedForm = await ctx.db.query.form.findFirst({
    where: formOrgWhere(ctx, formId),
    columns: { id: true },
  });

  if (!ownedForm) {
    throw formNotFoundError();
  }

  return ownedForm;
}
