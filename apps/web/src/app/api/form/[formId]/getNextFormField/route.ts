import { sendErrorResponse } from "@/lib/errorHandlers";
import { GenerateFormFieldService } from "@/lib/services/generateFormField";
import { formSchemaSystemPrompt } from "@/lib/services/systemPrompt";

// import { z } from "zod";

// const routeContextSchema = z.object({
//   params: z.object({
//     formId: z.string(),
//   }),
// });

export async function POST(
  req: Request,
  //   context: z.infer<typeof routeContextSchema>
) {
  try {
    // const { params } = routeContextSchema.parse(context);
    const requestJson = await req.json();
    const form = formSchemaSystemPrompt.parse(requestJson);

    const generateFormFieldService = new GenerateFormFieldService(form);

    return await generateFormFieldService.getNextFormField();
  } catch (error) {
    return sendErrorResponse(error);
  }
}
