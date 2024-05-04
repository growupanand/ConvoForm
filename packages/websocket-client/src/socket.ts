"use client";

import { io } from "socket.io-client";

import { URL } from "./constants";

export const socket = io(URL);
