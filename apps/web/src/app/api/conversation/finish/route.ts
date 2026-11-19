import {
  assertRequestConversationToken,
  clearConversationToken,
} from "@/lib/conversationToken";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const runtime = "nodejs";

const finishConversationSchema = z.object({
  conversationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await finishConversationSchema.parseAsync(
      await request.json(),
    );

    await assertRequestConversationToken(request, conversationId);

    return clearConversationToken(
      NextResponse.json({ success: true }),
      conversationId,
    );
  } catch (error) {
    return sendErrorResponse(error);
  }
}
