import type { UserIdentity } from "../schema";

// packages/analytics/src/providers/baseProvider.ts
export abstract class BaseProvider {
  abstract identify(user: UserIdentity): void;
  abstract track: Track;
}

export type Identify = (user: UserIdentity) => void;

export type Track = (
  eventName: string,
  properties?: Record<string, any> & {
    userId?: string;
  },
) => void;
