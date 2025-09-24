import { api } from "@/trpc/server";
import { createConversationSchema } from "@convoform/db/src/schema";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

const routeParamsSchema = z.object({
  formId: z.string(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ formId: string }> },
) {
  const routeParams = await context.params;
  const { formId } = routeParamsSchema.parse(routeParams);
  const existForm = await api.form.getOneWithFields({ id: formId });
  if (!existForm) {
    return Response.json(
      { error: "Form not found" },
      {
        status: 404,
      },
    );
  }
  const responseJSON = await createConversationSchema.parseAsync(existForm);
  return Response.json(responseJSON);
}
