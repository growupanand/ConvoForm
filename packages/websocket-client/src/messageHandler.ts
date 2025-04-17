type MessageHandler = (data?: any) => void;

export const eventHandlers: Record<string, MessageHandler[]> = {};

export function registerEventHandler(
  eventType: string,
  handler: MessageHandler,
) {
  if (!eventHandlers[eventType]) {
    eventHandlers[eventType] = [];
  }
  eventHandlers[eventType].push(handler);
}

export function removeEventHandler(eventType: string, handler: MessageHandler) {
  if (eventHandlers[eventType]) {
    const index = eventHandlers[eventType].indexOf(handler);
    if (index !== -1) {
      eventHandlers[eventType].splice(index, 1);
    }
  }
}
