import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";

const PORT = 4000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());

io.on("connection", (socket) => {
  console.log(`Connected client:${socket.id}\n`);

  socket.onAny((event, ...args) => {
    console.log(`Event: ${event}\n`, args);
  });

  socket.on("conversation:created", (data) => {
    console.log("conversation:created\n", data);
    const { formId } = data;
    if (typeof formId === "string") {
      io.emit(`form:${formId}`, { event: "conversation:created" });
    }
  });

  socket.on("conversation:updated", (data) => {
    console.log("conversation:updated\n", data);
    const { conversationId } = data;
    if (typeof conversationId === "string") {
      io.emit(`conversation:${conversationId}`, { event: "updated" });
    }
  });
});

server.listen(PORT, () => {
  console.log(`WEBSOCKET Server started on port ${PORT}\n`);
});
