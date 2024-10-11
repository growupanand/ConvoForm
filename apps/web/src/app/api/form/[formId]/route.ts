import { api } from "@/trpc/server";
import { createConversationSchema } from "@convoform/db/src/schema";
import type { NextRequest } from "next/server";
import { z } from "zod";

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function GET(
  _req: NextRequest,
  context: z.infer<typeof routeContextSchema>,
) {
  const {
    params: { formId },
  } = routeContextSchema.parse(context);
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
