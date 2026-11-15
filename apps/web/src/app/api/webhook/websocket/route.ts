import { verifyInternalRequest } from "@/app/api/internal/_utils";
import { sendErrorResponse } from "@/lib/errorHandlers";
import { handleWebsocketConversationStoppedInsights } from "@convoform/api/src/actions/conversation/handleWebsocketConversationStoppedInsights";
import { db, eq } from "@convoform/db";
import { conversation } from "@convoform/db/src/schema";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const eventData = z.object({
  conversationId: z.string(),
});

const websocketPayload = z.object({
  eventName: z.enum(["conversation:started", "conversation:stopped"]),
  eventData: eventData,
});

export async function POST(req: NextRequest) {
  const verification = await verifyInternalRequest(req);

  if (!verification.ok) {
    return verification.response;
  }

  try {
    const event = await websocketPayload.parseAsync(
      JSON.parse(verification.rawBody),
    );

    const { eventName, eventData } = event;

    switch (eventName) {
      case "conversation:started": {
        const { conversationId } = eventData;
        await updateInProgressStatus(conversationId, true);
        break;
      }

      case "conversation:stopped": {
        const { conversationId } = eventData;
        await updateInProgressStatus(conversationId, false);
        try {
          await handleWebsocketConversationStoppedInsights(conversationId, {
            db,
          });
        } catch (error) {
          console.error("Failed to generate insights:", error);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

async function updateInProgressStatus(
  conversationId: string,
  isInProgress: boolean,
) {
  const [result] = await db
    .update(conversation)
    .set({
      isInProgress,
      updatedAt: new Date(),
    })
    .where(eq(conversation.id, conversationId))
    .returning();

  if (!result) {
    throw new Error("Conversation not found");
  }
}
