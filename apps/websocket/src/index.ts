import { Server } from "socket.io";

const PORT = 3001;

const io = new Server(PORT);
console.log(`WEBSOCKET Server started on port ${PORT}\n`);

io.on("connection", (socket) => {
  console.log(`Connected client:${socket.id}\n`);
});
