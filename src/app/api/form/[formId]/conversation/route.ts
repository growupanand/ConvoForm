import { db } from "@/lib/db";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { getSystemPrompt } from "@/lib/prompts";
import { isValidJSON } from "@/lib/utils";
import { ConversationPayloadSchema } from "@/lib/validations/conversation";
import { OpenAIStream, StreamingTextResponse, streamToResponse } from "ai";
import { NextResponse } from "next/server";
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
    const { isFormSubmitted, isPreview } = reqPayload;

    // generate messages
    const form = await db.form.findUnique({
      where: {
        id: params.formId,
      },
      include: {
        formField: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    const { overview, aboutCompany, formField } = form;
    const formFields = formField.map((item) => item.fieldName);

    const systemPrompt = getSystemPrompt(
      overview,
      aboutCompany,
      formFields,
      isFormSubmitted
    );
    const systemMessage = {
      role: "system",
      content: systemPrompt,
    } as ChatCompletionRequestMessage;

    const messages = [systemMessage, ...reqPayload.messages];

    if (!isFormSubmitted) {
      const openAiResponse = await openai.createChatCompletion({
        model: "gpt-4",
        stream: true,
        messages,
      });

      const stream = OpenAIStream(openAiResponse);

      return new StreamingTextResponse(stream);
    }

    // save form data in database
    const openAiResponse = await openai.createChatCompletion({
      model: "gpt-4",
      stream: false,
      messages,
    });
    const openAiResponseJson = await openAiResponse.json();
    const response = openAiResponseJson.choices[0].message.content;
    if (!isValidJSON(response)) {
      return NextResponse.json(
        { success: false },
        {
          status: 400,
        }
      );
    }
    const responseJson = JSON.parse(response);

    if (!isPreview) {
      await db.conversation.create({
        data: {
          formId: params.formId,
          formFieldsData: responseJson,
          transcript: messages as Record<string, any>[],
        },
      });
    }

    return NextResponse.json(
      { success: true },
      {
        status: 200,
      }
    );
  } catch (error) {
    return sendErrorResponse(error);
  }
}
