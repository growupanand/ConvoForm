"use client";

import { io, Socket } from "socket.io-client";

import { URL } from "./constants";

export const socket: Socket = io(URL);
