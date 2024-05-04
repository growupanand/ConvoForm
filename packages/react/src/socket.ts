"use client";

import { io } from "socket.io-client";

import { URL } from "./const";

export const socket = io(URL);
