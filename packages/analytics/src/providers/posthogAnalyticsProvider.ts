import { withTracing } from "@posthog/ai";
import type { LanguageModel } from "ai";
import { PostHog } from "posthog-node";
import { repoPackageVersion } from "../constants";
import { isUserEmployee } from "../utils";
import { BaseProvider, type Identify, type Track } from "./baseProvider";

export class PosthogAnalyticsProvider extends BaseProvider {
  private client: PostHog | undefined;

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
        flushAt: 1,
        flushInterval: 0,
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
  };

  private resolveDistinctId(
    eventName: string,
    distinctId: string | undefined,
    properties?: Record<string, unknown>,
  ): string | undefined {
    const resolvedDistinctId =
      distinctId ??
      (typeof properties?.userId === "string"
        ? properties.userId
        : undefined) ??
      (typeof properties?.conversationId === "string"
        ? properties.conversationId
        : undefined);

    if (!resolvedDistinctId) {
      console.warn(
        `Analytics: skipped "${eventName}" because distinctId is missing`,
      );
    }

    return resolvedDistinctId;
  }

  track: Track = async (eventName, { properties, groups, distinctId }) => {
    const resolvedDistinctId = this.resolveDistinctId(
      eventName,
      distinctId,
      properties,
    );

    if (!resolvedDistinctId) {
      return;
    }

    const email =
      typeof properties?.email === "string" ? properties.email : undefined;

    this.client?.capture({
      distinctId: resolvedDistinctId,
      event: eventName,
      properties: {
        ...properties,
        appVersion: repoPackageVersion,
        isUserEmployee: isUserEmployee(email ?? resolvedDistinctId),
      },
      groups,
    });

    await this.client?.flush();
  };

  captureException = async (error: Error, distinctId?: string) => {
    this.client?.captureException(error, distinctId);
    await this.client?.flush();
  };

  /**
   * Creates a traced language model for LLM analytics
   * @param model The original language model from AI SDK
   * @param metadata Optional metadata to enrich analytics events
   * @returns Traced model that captures analytics events
   */
  createTracedModel = (
    model: Exclude<LanguageModel, string>,
    metadata?: {
      userId?: string;
      traceId?: string;
      formId?: string;
      conversationId?: string;
      organizationId?: string;
      actionType?: string;
      fieldType?: string;
      isAnonymous?: boolean;
      [key: string]: unknown;
    },
  ): LanguageModel => {
    // If PostHog client is not available, return original model
    if (!this.client) {
      console.warn("PostHog client not available, skipping LLM tracing");
      return model;
    }

    // Check if LLM analytics is enabled
    const isEnabled = true; // TODO: Enable analytics based on environment variable
    if (!isEnabled) {
      return model;
    }

    const posthogDistinctId =
      metadata?.userId ?? metadata?.conversationId ?? undefined;

    if (!posthogDistinctId) {
      console.warn(
        "Analytics: LLM tracing skipped because distinctId is missing",
      );
      return model;
    }

    try {
      return withTracing(model, this.client, {
        posthogDistinctId,
        posthogTraceId: metadata?.traceId,
        posthogProperties: {
          appVersion: repoPackageVersion,
          isUserEmployee: metadata?.userId
            ? isUserEmployee(metadata.userId)
            : false,
          formId: metadata?.formId,
          conversationId: metadata?.conversationId,
          organizationId: metadata?.organizationId,
          actionType: metadata?.actionType,
          fieldType: metadata?.fieldType,
          isAnonymous: metadata?.isAnonymous ?? true,
          ...metadata,
        },
        posthogPrivacyMode: false,
        posthogGroups: metadata?.organizationId
          ? {
              organization: metadata.organizationId,
            }
          : undefined,
      });
    } catch (error) {
      // Log error to console and capture exception in PostHog
      console.error("Failed to create traced model:", error);
      if (error instanceof Error) {
        void this.captureException(error);
      }
      // Fallback to original model to ensure application functionality
      return model;
    }
  };
}
