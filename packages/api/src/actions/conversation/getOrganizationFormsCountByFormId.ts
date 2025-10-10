import { alias, count, eq } from "@convoform/db";
import { conversation, form } from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export async function getOrganizationFormsCountByFormId(
  formId: string,
  ctx: ActionContext,
) {
  // Count all conversations for all forms in the same organization as the input form
  // Use a single optimized query with form table aliasing to avoid subquery
  const targetForm = alias(form, "targetForm");
  const query = ctx.db
    .select({ value: count() })
    .from(conversation)
    .innerJoin(form, eq(conversation.formId, form.id))
    .innerJoin(targetForm, eq(form.organizationId, targetForm.organizationId))
    .where(eq(targetForm.id, formId));

  const [result] = await query;

  return result?.value;
}
