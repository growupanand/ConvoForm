import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getSystemPrompt } from "@/lib/prompts";
import { ConversationPayloadSchema } from "@/lib/validations/conversation";
import { OpenAIStream, StreamingTextResponse } from "ai";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { z } from "zod";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const routeContextSchema = z.object({
  params: z.object({
    formId: z.string(),
  }),
});

export async function POST(
  req: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    const { params } = routeContextSchema.parse(context);
    const requestJson = await req.json();
    const reqPayload = ConversationPayloadSchema.parse(requestJson);

    // generate messages
    const form = await db.form.findUnique({
      where: {
        id: params.formId,
      },
      include: {
        journey: true,
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    const { overview, aboutCompany, journey } = form;
    const formFields = journey.map((item) => item.fieldName);

    const systemPrompt = getSystemPrompt(overview, aboutCompany, formFields);
    const systemMessage = {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;

    const messages = [systemMessage, ...reqPayload.messages];

    const openAiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
    });
    const stream = OpenAIStream(openAiResponse);
    return new StreamingTextResponse(stream);
  } catch (error) {
    return sendErrorResponse(error);
  }
}
