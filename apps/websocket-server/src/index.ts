import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";

import { IS_PROD } from "./constants";
import { conversationStarted, conversationStopped } from "./controller";
import {
  getConversationRoom,
  getFormRoom,
  isValidId,
} from "./utils/socket.utils";

const PORT = 4000;
/**
 * ============ HTTP SERVER ============
 */
const app = express();
const server = createServer(app);
app.use(express.json());

app.get("/", (_, res) => {
  res.send("Working");
});

/**
 * ============ WEBSOCKET SERVER ============
 */

const io = new Server(server, {
  cors: {
    origin: IS_PROD ? /https:\/\/(.+?)\.convoform.com/ : "*",
  },
});

type ActiveSocketContext = {
  activeConversationId: string | null;
  activeFormId: string | null;
};

io.on("connection", async (socket) => {
  /**
   * Create an context for current connect socket client,
   * This is useful if you want to save any state for current socket client which you need after client disconnect
   * E.g. you cannot get any data from client if client disconnected by closing the browser
   */
  const activeSocketContext: ActiveSocketContext = {
    activeConversationId: null,
    activeFormId: null,
  };

  /**
   * Note: In socket.io rooms can be joined only server side, we can't join room from client side
   * So we will use this event to help client to join the room
   */

  // Handle joining a form-specific room to receive updates for a particular form
  // This allows clients to subscribe to events related to a specific form (e.g., notifications for new submissions)
  socket.on("join-room-form", (data) => {
    const { formId } = data;
    if (!isValidId(formId)) {
      return;
    }
    socket.join(getFormRoom(formId));
  });

  // Handle joining a conversation-specific room to receive updates for a particular conversation
  // This allows clients to subscribe to events related to a specific conversation (e.g., update conversation detail page for showing live transcript)
  socket.on("join-room-conversation", (data) => {
    const { conversationId } = data;
    if (!isValidId(conversationId)) {
      return;
    }
    socket.join(getConversationRoom(conversationId));
  });

  // =============== Conversation started ===============================

  // when a new form submission started
  socket.on("conversation:started", async (data) => {
    const { conversationId, formId } = data;

    if (!isValidId(formId) || !isValidId(conversationId)) {
      return;
    }

    // Lets store the active conversation and form details in socket context data
    activeSocketContext.activeConversationId = conversationId;
    activeSocketContext.activeFormId = formId;

    // First change conversation status to in-progress in the database
    try {
      await conversationStarted(conversationId);
    } catch (error) {
      // if we failed to change the conversation status to in-progress
      console.log(
        `conversationId:${conversationId}> Error sending conversation:started event`,
        error,
      );
    }

    // Now lets first notify the form creator that an new form submission started
    io.to(getFormRoom(formId)).emit("conversation:started");

    return;
  });

  // ============== Conversation updated ===============================

  // when a user answer a question in form
  socket.on("conversation:updated", (data) => {
    const { conversationId } = data;
    if (!isValidId(conversationId)) {
      return;
    }

    // We will notify in the conversation room
    socket.join(getConversationRoom(conversationId));

    // Now lets notify the form creator that user has answered a question or form submission progress updated
    io.to(getConversationRoom(conversationId)).emit("conversation:updated");
  });

  // ============== Conversation stopped ===============================

  // when user answered all questions of form
  socket.on("conversation:stopped", async (data) => {
    const { conversationId, formId } = data;
    if (!isValidId(conversationId) || !isValidId(formId)) {
      return;
    }

    // First change conversation status to in-progress in the database
    try {
      await conversationStopped(conversationId);
    } catch (error) {
      // if we failed to change the conversation status to in-progress
      console.log(
        `conversationId:${conversationId}> Error sending conversation:stopped event`,
        error,
      );
    }

    // Now notify the form creator that an form submission has finished
    io.to(getFormRoom(formId)).emit("conversation:stopped");

    // Now notify the conversation room that this conversation has finished
    io.to(getConversationRoom(conversationId)).emit("conversation:stopped");
  });

  // when user left form submission without answering all questions,
  // E.g. closed the browser or disconnected due to network issue
  socket.on("disconnect", async () => {
    // If this socket was participating in an active conversation
    if (
      activeSocketContext.activeConversationId &&
      activeSocketContext.activeFormId
    ) {
      const conversationId = activeSocketContext.activeConversationId;
      const formId = activeSocketContext.activeFormId;

      // Only stop conversation if it exists and is valid
      if (isValidId(conversationId) && isValidId(formId)) {
        try {
          // Update conversation status to stopped
          await conversationStopped(conversationId);

          // Notify the form room
          io.to(getFormRoom(formId)).emit("conversation:stopped");

          // Notify the conversation room
          io.to(getConversationRoom(conversationId)).emit(
            "conversation:stopped",
          );
        } catch (error) {
          console.log(
            `conversationId:${conversationId}> Error handling disconnect event`,
            error,
          );
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(
    `WEBSOCKET Server (${IS_PROD ? "Production" : "Development"}) started on port ${PORT}\n`,
  );
});
