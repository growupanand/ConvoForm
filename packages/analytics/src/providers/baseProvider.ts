import type {
  EventGroupName,
  EventName,
  EventProperties,
  UserIdentity,
} from "../schema";

// packages/analytics/src/providers/baseProvider.ts
export abstract class BaseProvider {
  abstract identify(user: UserIdentity): void;
  abstract track: Track;
}

export type Identify = (user: UserIdentity) => void;

export type Track = (
  eventName: EventName,
  eventDetails: {
    properties?: EventProperties;
    groups?: {
      [key in EventGroupName]?: string;
    };
  },
) => void;
