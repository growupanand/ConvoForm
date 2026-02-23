/**
 * ============================================
 * ----------- CHANNELS SERVER ----------------
 * ============================================
 *
 * Next.js App Router wrapper for the ChannelServer.
 *
 * This is a thin bootstrap that:
 * 1. Creates a ChannelServer with InMemorySessionManager
 * 2. Exports GET and POST handlers
 *
 * All business logic lives in @convoform/channels.
 */

import {
  ChannelServer,
  InMemorySessionManager,
  buildChannelServerOperations,
} from "@convoform/channels";

// ── Create Server ─────────────────────────────────────────

const sessionManager = new InMemorySessionManager();

const server = new ChannelServer({
  sessionManager,
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  operations: buildChannelServerOperations(),
});

// ── Next.js Route Handlers ────────────────────────────────

export async function GET(req: Request) {
  return server.handleRequest(req);
}

export async function POST(req: Request) {
  return server.handleRequest(req);
}
