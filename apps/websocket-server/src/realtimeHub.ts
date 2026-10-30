import { DurableObject } from "cloudflare:workers";
import { conversationStarted, conversationStopped } from "./controller";
import {
  getConversationRoom,
  getFormRoom,
  isValidId,
} from "./utils/socket.utils";

type SocketState = {
  activeConversationId: string | null;
  activeFormId: string | null;
  rooms: string[];
};

type ClientMessage = {
  type: string;
  data: Record<string, unknown>;
};

function emptyState(): SocketState {
  return {
    activeConversationId: null,
    activeFormId: null,
    rooms: [],
  };
}

function isSocketState(value: unknown): value is SocketState {
  if (!value || typeof value !== "object") return false;
  const state = value as SocketState;
  return (
    (typeof state.activeConversationId === "string" ||
      state.activeConversationId === null) &&
    (typeof state.activeFormId === "string" || state.activeFormId === null) &&
    Array.isArray(state.rooms) &&
    state.rooms.every((room) => typeof room === "string")
  );
}

function readState(ws: WebSocket): SocketState {
  const attachment = ws.deserializeAttachment();
  if (isSocketState(attachment)) return attachment;
  return emptyState();
}

function writeState(ws: WebSocket, state: SocketState) {
  ws.serializeAttachment(state);
}

function joinRoom(ws: WebSocket, roomName: string) {
  const state = readState(ws);
  if (state.rooms.includes(roomName)) return;
  writeState(ws, { ...state, rooms: [...state.rooms, roomName] });
}

function parseClientMessage(raw: string): ClientMessage | null {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") return null;
  const message = parsed as { type?: unknown; data?: unknown };
  if (typeof message.type !== "string") return null;
  if (!message.data || typeof message.data !== "object") {
    return { type: message.type, data: {} };
  }
  return { type: message.type, data: message.data as Record<string, unknown> };
}

export class RealtimeHub extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("Upgrade");
    if (upgrade?.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.ctx.acceptWebSocket(server);
    writeState(server, emptyState());

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      if (typeof message !== "string") return;
      const parsed = parseClientMessage(message);
      if (!parsed) return;

      switch (parsed.type) {
        case "join-room-form": {
          const { formId } = parsed.data;
          if (!isValidId(formId)) return;
          joinRoom(ws, getFormRoom(formId));
          break;
        }
        case "join-room-conversation": {
          const { conversationId } = parsed.data;
          if (!isValidId(conversationId)) return;
          joinRoom(ws, getConversationRoom(conversationId));
          break;
        }
        case "conversation:started": {
          await this.handleStarted(ws, parsed.data);
          break;
        }
        case "conversation:updated": {
          this.handleUpdated(ws, parsed.data);
          break;
        }
        case "conversation:stopped": {
          await this.handleStopped(parsed.data);
          break;
        }
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  }

  async webSocketClose(
    ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ) {
    const state = readState(ws);
    try {
      await this.handleDisconnect(state);
    } finally {
      try {
        ws.close();
      } catch {
        // The runtime already closed this socket.
      }
    }
  }

  async webSocketError(ws: WebSocket, error: unknown) {
    const conversationId = readState(ws).activeConversationId;
    console.log(
      conversationId
        ? `conversationId:${conversationId}> WebSocket error`
        : "WebSocket error",
      error,
    );
  }

  private async handleStarted(ws: WebSocket, data: Record<string, unknown>) {
    const { conversationId, formId } = data;
    if (!isValidId(formId) || !isValidId(conversationId)) return;

    const state = readState(ws);
    writeState(ws, {
      ...state,
      activeConversationId: conversationId,
      activeFormId: formId,
    });

    await this.callApi(
      conversationStarted(conversationId, this.env.NEXT_PUBLIC_APP_URL),
      `conversationId:${conversationId}> Error sending conversation:started event`,
    );

    this.broadcastToRoom(getFormRoom(formId), {
      type: "conversation:started",
    });
  }

  private handleUpdated(ws: WebSocket, data: Record<string, unknown>) {
    const { conversationId, formId } = data;
    if (!isValidId(conversationId)) return;

    const conversationRoom = getConversationRoom(conversationId);
    joinRoom(ws, conversationRoom);
    this.broadcastToRoom(conversationRoom, { type: "conversation:updated" });

    if (!isValidId(formId)) return;

    const formRoom = getFormRoom(formId);
    joinRoom(ws, formRoom);
    this.broadcastToRoom(formRoom, { type: "conversation:updated" });
  }

  private async handleStopped(data: Record<string, unknown>) {
    const { conversationId, formId } = data;
    if (!isValidId(conversationId) || !isValidId(formId)) return;

    await this.callApi(
      conversationStopped(conversationId, this.env.NEXT_PUBLIC_APP_URL),
      `conversationId:${conversationId}> Error sending conversation:stopped event`,
    );

    this.broadcastToRoom(getFormRoom(formId), {
      type: "conversation:stopped",
    });
    this.broadcastToRoom(getConversationRoom(conversationId), {
      type: "conversation:stopped",
    });
  }

  private async handleDisconnect(state: SocketState) {
    const { activeConversationId, activeFormId } = state;
    if (!isValidId(activeConversationId) || !isValidId(activeFormId)) return;

    await this.callApi(
      conversationStopped(activeConversationId, this.env.NEXT_PUBLIC_APP_URL),
      `conversationId:${activeConversationId}> Error handling disconnect event`,
    );

    this.broadcastToRoom(getFormRoom(activeFormId), {
      type: "conversation:stopped",
    });
    this.broadcastToRoom(getConversationRoom(activeConversationId), {
      type: "conversation:stopped",
    });
  }

  private async callApi(request: Promise<unknown>, errorMessage: string) {
    const pending = request.catch((error) => {
      console.log(errorMessage, error);
    });
    this.ctx.waitUntil(pending);
    await pending;
  }

  private broadcastToRoom(roomName: string, message: Record<string, unknown>) {
    const payload = JSON.stringify(message);
    for (const client of this.ctx.getWebSockets()) {
      if (!readState(client).rooms.includes(roomName)) continue;
      if (client.readyState !== WebSocket.OPEN) continue;
      try {
        client.send(payload);
      } catch (error) {
        console.log(`Failed to broadcast to ${roomName}`, error);
      }
    }
  }
}
