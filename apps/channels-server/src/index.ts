/**
 * ============================================
 * ----------- CHANNELS SERVER ----------------
 * ============================================
 *
 * Bun runtime wrapper for the ChannelServer.
 *
 * This is a thin bootstrap that:
 * 1. Creates a ChannelServer with InMemorySessionManager
 * 2. Sets up periodic session cleanup (Bun-specific)
 * 3. Starts Bun.serve()
 *
 * All business logic lives in @convoform/channels.
 */

import {
  ChannelServer,
  InMemorySessionManager,
  buildChannelServerOperations,
} from "@convoform/channels";

const PORT = process.env.CHANNELS_SERVER_PORT ?? 4001;

// ── Create Server ─────────────────────────────────────────

const sessionManager = new InMemorySessionManager();

const server = new ChannelServer({
  sessionManager,
  encryptionKey: process.env.ENCRYPTION_KEY ?? "",
  operations: buildChannelServerOperations(),
});

// ── Bun-Specific: Periodic Session Cleanup ────────────────

const SESSION_CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

setInterval(() => {
  const cleared = sessionManager.clearExpiredSessions(SESSION_MAX_AGE_MS);
  if (cleared > 0) {
    console.log(`[sessions] Cleared ${cleared} expired sessions`);
  }
}, SESSION_CLEANUP_INTERVAL_MS);

// ── Start Server ──────────────────────────────────────────

console.log(`Starting channels server on http://localhost:${PORT}`);

// biome-ignore lint/correctness/noUndeclaredVariables: Bun is the runtime
Bun.serve({
  port: Number(PORT),
  fetch: (req: Request) => server.handleRequest(req),
});
