import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const IS_PROD = process.env.NODE_ENV === "production";
const PORT = 4000;

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
    origin: IS_PROD ? "convoform.com" : "*",
  },
});

io.on("connection", (socket) => {
  socket.on("conversation:created", (data) => {
    const { formId } = data;
    if (typeof formId === "string") {
      io.emit(`form:${formId}`, { event: "conversation:created" });
    }
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
