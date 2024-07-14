import { type Socket, io } from "socket.io-client";

import { WEBSOCKET_URL } from "./constants";

export const socket: Socket = io(WEBSOCKET_URL);
