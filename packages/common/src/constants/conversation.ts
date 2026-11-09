/**
 * How long an external channel conversation (no websocket lifecycle) stays
 * active after its last update. Web conversations use isInProgress instead.
 */
export const ACTIVE_CONVERSATION_WINDOW_MS = 30 * 60 * 1000;
