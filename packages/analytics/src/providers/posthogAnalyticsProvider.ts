import { PostHog } from "posthog-node";
import { repoPackageVersion } from "../constants";
import { isUserEmployee } from "../utils";
import { BaseProvider, type Identify, type Track } from "./baseProvider";

export class PosthogAnalyticsProvider extends BaseProvider {
  private client: PostHog | undefined;
  distinctId = "unkown";

  constructor() {
    super();
    if (
      !process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      !process.env.NEXT_PUBLIC_POSTHOG_HOST
    ) {
      console.warn(
        "Analytics will not work because required environment variables is not set",
      );
    } else {
      this.client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      });
    }
  }

  identify: Identify = ({ userId, name, email }) => {
    this.client?.identify({
      distinctId: userId,
      properties: {
        email,
        name,
      },
    });
    this.distinctId = userId;
  };

  track: Track = (eventName, { properties, groups }) => {
    const userId = properties?.userId ?? this.distinctId;

    this.client?.capture({
      distinctId: userId,
      event: eventName,
      properties: {
        ...properties,
        appVersion: repoPackageVersion,
        isUserEmployee: isUserEmployee(userId),
      },
      groups,
    });
  };

  alias = (
    /** user email, number, etc */
    customId: string,
    userId: string,
  ) => {
    this.client?.alias({
      alias: customId,
      distinctId: userId,
    });
    this.distinctId = customId;
  };
}
