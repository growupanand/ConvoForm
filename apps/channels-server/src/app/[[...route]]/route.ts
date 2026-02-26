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
  DbSessionManager,
  buildChannelServerOperations,
  env,
} from "@convoform/channels";

export const runtime = "edge";
export const maxDuration = 60;

// ── Create Server ─────────────────────────────────────────

const sessionManager = new DbSessionManager();

const server = new ChannelServer({
  sessionManager,
  encryptionKey: env.ENCRYPTION_KEY,
  operations: buildChannelServerOperations(),
});

// ── Next.js Route Handlers ────────────────────────────────

export async function GET(req: Request) {
  return server.handleRequest(req);
}

export async function POST(req: Request) {
  return server.handleRequest(req);
}
