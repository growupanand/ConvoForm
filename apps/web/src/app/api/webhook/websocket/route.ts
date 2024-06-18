/* eslint-disable no-case-declarations */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendErrorResponse } from "@/lib/errorHandlers";
import { api } from "@/trpc/server";

const eventData = z.object({
  conversationId: z.string(),
});

const websocketPayload = z.object({
  eventName: z.enum(["conversation:started", "conversation:stopped"]),
  eventData: eventData,
});

export async function POST(req: NextRequest) {
  const requestJSON = await req.json();
  try {
    const event = await websocketPayload.parseAsync(requestJSON);

    const { eventName, eventData } = event;

    switch (eventName) {
      case "conversation:started": {
        const { conversationId } = eventData;
        await api.conversation.updateInProgressStatus({
          id: conversationId,
          isInProgress: true,
        });
        break;
      }

      case "conversation:stopped": {
        const { conversationId } = eventData;
        await api.conversation.updateInProgressStatus({
          id: conversationId,
          isInProgress: false,
        });
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
