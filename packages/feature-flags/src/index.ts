import { PostHog } from "posthog-node";

interface FeatureFlagConfig {
  userId?: string;
  organizationId?: string;
  distinctId: string;
  groupType?: string;
  groupKey?: string;
}

interface FeatureFlags {
  "file-upload-beta": boolean;
  "file-upload-admin": boolean;
  "increased-storage-limits": boolean;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  value: boolean;
  timestamp: number;
}

export class FeatureFlagService {
  private client: PostHog | null = null;
  private cache: Map<string, CacheEntry> = new Map();

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (apiKey) {
      this.client = new PostHog(apiKey, {
        host: host || "https://app.posthog.com",
      });
    } else {
      console.warn("PostHog API key not found, using default feature flags");
    }
  }

  async isFeatureEnabled<K extends keyof FeatureFlags>(
    flag: K,
    config: FeatureFlagConfig,
  ): Promise<boolean> {
    const cacheKey = `${flag}:${config.distinctId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.value;
    }

    try {
      if (this.client) {
        const isEnabled = await this.client.isFeatureEnabled(
          flag,
          config.distinctId,
          {
            groups:
              config.groupType && config.groupKey
                ? { [config.groupType]: config.groupKey }
                : undefined,
          },
        );

        // PostHog returns boolean | undefined. Treat undefined as false (or fallback)
        // If undefined, we usually fallback to default, but here we cache the result if it's boolean
        if (typeof isEnabled === "boolean") {
          this.cache.set(cacheKey, {
            value: isEnabled,
            timestamp: Date.now(),
          });
          return isEnabled;
        }
      }
    } catch (error) {
      console.error(`Error checking feature flag ${flag}:`, error);
    }

    return this.getDefaultValue(flag);
  }

  async getAllFeatureFlags(
    config: FeatureFlagConfig,
  ): Promise<Partial<FeatureFlags>> {
    try {
      if (this.client) {
        const flags = await this.client.getAllFlags(config.distinctId, {
          groups:
            config.groupType && config.groupKey
              ? { [config.groupType]: config.groupKey }
              : undefined,
        });

        const result: Partial<FeatureFlags> = {};
        const knownFlags: (keyof FeatureFlags)[] = [
          "file-upload-beta",
          "file-upload-admin",
          "increased-storage-limits",
        ];

        for (const key of knownFlags) {
          const value = flags[key];
          if (typeof value === "boolean") {
            result[key] = value;
          }
        }

        return {
          ...this.getDefaultFlags(),
          ...result,
        };
      }
    } catch (error) {
      console.error("Error getting all feature flags:", error);
    }
    return this.getDefaultFlags();
  }

  private getDefaultValue<K extends keyof FeatureFlags>(flag: K): boolean {
    const defaults: FeatureFlags = {
      "file-upload-beta": true, // Default to true as per original code
      "file-upload-admin": false,
      "increased-storage-limits": false,
    };

    return defaults[flag];
  }

  private getDefaultFlags(): Partial<FeatureFlags> {
    return {
      "file-upload-beta": true,
      "file-upload-admin": false,
      "increased-storage-limits": false,
    };
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();

// Export types
export type { FeatureFlags, FeatureFlagConfig };
