import { type ServerWebSocket, serve } from "bun";
import { conversationStarted, conversationStopped } from "./controller";
import {
  getConversationRoom,
  getFormRoom,
  isValidId,
} from "./utils/socket.utils";

const PORT = process.env.PORT ?? 4000;

/**
 * ============ WEBSOCKET SERVER ============
 */

// Map to store active socket connections and their metadata
const clients = new Map();

// Room management - map room names to sets of WebSocket clients
const rooms = new Map();

// Helper to join a room
function joinRoom(roomName: string, socket: ServerWebSocket<unknown>) {
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }
  rooms.get(roomName).add(socket);
}

// Helper to broadcast to a room
function broadcastToRoom(roomName: string, message: Record<string, any>) {
  if (!rooms.has(roomName)) return;

  for (const client of rooms.get(roomName)) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}

console.log("starting websocket server", `http://localhost:${PORT}`);
// Start the Bun WebSocket server
serve({
  port: PORT,
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    open(ws) {
      // Initialize client data
      clients.set(ws, {
        activeConversationId: null,
        activeFormId: null,
      });
    },
    async message(ws, message) {
      try {
        if (typeof message !== "string") return;
        const { type, data } = JSON.parse(message);
        const socketContext = clients.get(ws);

        switch (type) {
          case "join-room-form": {
            const { formId } = data;
            if (!isValidId(formId)) return;
            joinRoom(getFormRoom(formId), ws);
            break;
          }

          case "join-room-conversation": {
            const { conversationId } = data;
            if (!isValidId(conversationId)) return;
            joinRoom(getConversationRoom(conversationId), ws);
            break;
          }

          case "conversation:started": {
            const { conversationId, formId } = data;

            if (!isValidId(formId) || !isValidId(conversationId)) return;

            // Store active conversation in socket context
            socketContext.activeConversationId = conversationId;
            socketContext.activeFormId = formId;

            // Update database
            await conversationStarted(conversationId).catch((error) => {
              console.log(
                `conversationId:${conversationId}> Error sending conversation:started event`,
                error,
              );
            });

            // Notify the form room
            broadcastToRoom(getFormRoom(formId), {
              type: "conversation:started",
            });
            break;
          }

          case "conversation:updated": {
            const { conversationId, formId } = data;

            if (!isValidId(conversationId)) return;

            // Join the conversation room if not already
            joinRoom(getConversationRoom(conversationId), ws);

            // Notify the conversation room
            broadcastToRoom(getConversationRoom(conversationId), {
              type: "conversation:updated",
            });

            if (!isValidId(formId)) return;

            // Join the form room if not already
            joinRoom(getFormRoom(formId), ws);

            // Notify the form room
            broadcastToRoom(getFormRoom(formId), {
              type: "conversation:updated",
            });
            break;
          }

          case "conversation:stopped": {
            const { conversationId, formId } = data;
            if (!isValidId(conversationId) || !isValidId(formId)) return;

            // Update database
            await conversationStopped(conversationId).catch((error) => {
              console.log(
                `conversationId:${conversationId}> Error sending conversation:stopped event`,
                error,
              );
            });

            // Notify both rooms
            broadcastToRoom(getFormRoom(formId), {
              type: "conversation:stopped",
            });
            broadcastToRoom(getConversationRoom(conversationId), {
              type: "conversation:stopped",
            });
            break;
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    },
    async close(ws) {
      const socketContext = clients.get(ws);
      if (!socketContext) return;

      const { activeConversationId, activeFormId } = socketContext;

      // Handle disconnect similar to Socket.io
      if (activeConversationId && activeFormId) {
        if (isValidId(activeConversationId) && isValidId(activeFormId)) {
          // Update database
          await conversationStopped(activeConversationId).catch((error) => {
            console.log(
              `conversationId:${activeConversationId}> Error handling disconnect event`,
              error,
            );
          });

          // Notify both rooms
          broadcastToRoom(getFormRoom(activeFormId), {
            type: "conversation:stopped",
          });
          broadcastToRoom(getConversationRoom(activeConversationId), {
            type: "conversation:stopped",
          });
        }
      }

      // Clean up
      clients.delete(ws);

      // Remove from all rooms
      for (const roomClients of rooms.values()) {
        roomClients.delete(ws);
      }
    },
  },
});
