import { WEBSOCKET_URL } from "./constants";
import { eventHandlers } from "./messageHandler";

// Create WebSocket connection
let socket: WebSocket | null = null;

// Reconnection parameters
const RECONNECT_INTERVAL = 2000; // 2 seconds between reconnection attempts
const MAX_RECONNECT_ATTEMPTS = 2;
let reconnectAttempts = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// Queue messages when socket is not connected
const messageQueue: Array<{ type: string; data: any }> = [];

// Initialize WebSocket connection
function initializeSocket() {
  if (typeof window === "undefined") return null; // Guard against server-side usage

  try {
    socket = new WebSocket(WEBSOCKET_URL);

    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      reconnectAttempts = 0;

      // Send any queued messages
      while (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message && socket?.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: message.type,
              data: message.data,
            }),
          );
        }
      }
    });

    socket.addEventListener("close", (event) => {
      console.log(`WebSocket connection closed: ${event.code}`);

      // Attempt to reconnect if not a clean close
      if (!event.wasClean && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          console.log(
            `Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`,
          );
          initializeSocket();
        }, RECONNECT_INTERVAL);
      }
    });

    socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socket.addEventListener("message", (event) => {
      try {
        const { type, data } = JSON.parse(event.data);

        // If there are handlers registered for this event type, call them
        if (eventHandlers[type]) {
          eventHandlers[type].forEach((handler) => handler(data));
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    });

    return socket;
  } catch (error) {
    console.error("Failed to create WebSocket connection:", error);
    return null;
  }
}

// Initialize socket when this module loads (client-side only)
if (typeof window !== "undefined") {
  initializeSocket();
}

// Function to send message to server
function sendMessage(type: string, data: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    // Queue message for when connection is established
    messageQueue.push({ type, data });

    // If socket is null or closed (and not reconnecting), try to initialize
    if (
      !socket ||
      (socket.readyState === WebSocket.CLOSED && !reconnectTimer)
    ) {
      initializeSocket();
    }
    return;
  }

  socket.send(JSON.stringify({ type, data }));
}

// Clean up function for component unmount
function cleanup() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (socket) {
    socket.close(1000, "Component unmounted");
  }
}

export { socket, sendMessage, cleanup };
