import { and, eq } from "@convoform/db";
import { organizationMember } from "@convoform/db/src/schema";
import type { ActionContext } from "../../types/actionContextType";

export async function isFormOrganizationMember(
  organizationId: string,
  clerkUserId: string | null | undefined,
  ctx: Pick<ActionContext, "db">,
): Promise<boolean> {
  if (!clerkUserId) {
    return false;
  }

  const member = await ctx.db.query.organizationMember.findFirst({
    where: and(
      eq(organizationMember.userId, clerkUserId),
      eq(organizationMember.organizationId, organizationId),
    ),
    columns: { id: true },
  });

  return member != null;
}
