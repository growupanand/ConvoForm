import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

import { apiEndpoint, IS_PROD } from "./constants";
import { conversationStarted, conversationStopped } from "./controller";
import { extractDomainFromUrl } from "./utils";

const PORT = 4000;
const DOMAIN = extractDomainFromUrl(apiEndpoint);
console.log({ DOMAIN });
/**
 * ============ HTTP SERVER ============
 */
const app = express();
const server = createServer(app);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Working");
});

/**
 * ============ WEBSOCKET SERVER ============
 */

const io = new Server(server, {
  cors: {
    origin: /https:\/\/(.+?)\.convoform\.com/,
  },
});

io.on("connection", async (socket) => {
  socket.on("conversation:started", async (data) => {
    const { conversationId, formId } = data;
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

    // When user leave the conversation, we need to update the conversation status
    socket.on("disconnect", async () => {
      try {
        await conversationStopped(conversationId);
      } catch (error) {
        console.error("Error sending conversation:stopped event", error);
      }
    });

    socket.on("conversation:stopped", async () => {
      try {
        await conversationStopped(conversationId);
        io.emit(`conversation:${conversationId}`, { event: "updated" });
        io.emit(`form:${formId}`, { event: "conversations:updated" });
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
