import { createServer } from "node:http";
import express from "express";
import { Server } from "socket.io";

import { IS_PROD } from "./constants";
import { conversationStarted, conversationStopped } from "./controller";

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

io.on("connection", async (socket) => {
  socket.on("conversation:started", async (data) => {
    const { conversationId, formId } = data;

    const onConversationStopped = ({
      conversationId,
      formId,
    }: {
      conversationId: string;
      formId: string;
    }) => {
      if (
        typeof conversationId === "string" &&
        conversationId.trim().length > 0
      ) {
        io.emit(`conversation:${conversationId}`, { event: "updated" });
      }
      if (typeof formId === "string" && formId.trim().length > 0) {
        io.emit(`form:${formId}`, { event: "conversations:updated" });
      }
    };

    if (typeof conversationId === "string") {
      try {
        await conversationStarted(conversationId);
      } catch (error) {
        console.error("Error sending conversation:started event", error);
      }
    }

    if (typeof formId === "string") {
      io.emit(`form:${formId}`, { event: "conversations:updated" });
      io.emit(`form:${formId}`, { event: "conversations:started" });
    }

    // When user leave the conversation (E.g close browser), we need to update the conversation status
    socket.on("disconnect", async () => {
      try {
        await conversationStopped(conversationId);
        onConversationStopped({ conversationId, formId });
      } catch (error) {
        console.error("Error sending conversation:stopped event", error);
      }
    });

    socket.on("conversation:stopped", async (data) => {
      const { conversationId, formId } = data;
      try {
        await conversationStopped(conversationId);
        onConversationStopped({ conversationId, formId });
      } catch (error) {
        console.error("Error sending conversation:stopped event", error);
      }
    });
  });

  socket.on("conversation:updated", (data) => {
    const { conversationId } = data;
    if (typeof conversationId === "string") {
      io.emit(`conversation:${conversationId}`, { event: "updated" });
    }
  });
});

server.listen(PORT, () => {
  console.log(
    `WEBSOCKET Server (${IS_PROD ? "Production" : "Development"}) started on port ${PORT}\n`,
  );
});
