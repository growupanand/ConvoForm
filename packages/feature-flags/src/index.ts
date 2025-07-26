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

export class FeatureFlagService {
  async isFeatureEnabled<K extends keyof FeatureFlags>(
    flag: K,
    config: FeatureFlagConfig,
  ): Promise<boolean> {
    // For now, return default values while PostHog integration is being set up
    // TODO: Integrate with PostHog feature flags API when ready
    console.log(`Feature flag check: ${flag} for ${config.distinctId}`);
    return this.getDefaultValue(flag);
  }

  async getAllFeatureFlags(
    config: FeatureFlagConfig,
  ): Promise<Partial<FeatureFlags>> {
    // Return default flags for now
    console.log(`Getting all feature flags for ${config.distinctId}`);
    return this.getDefaultFlags();
  }

  private getDefaultValue<K extends keyof FeatureFlags>(flag: K): boolean {
    const defaults: FeatureFlags = {
      "file-upload-beta": true, // Beta disabled by default
      "file-upload-admin": false, // Admin controls disabled by default
      "increased-storage-limits": false, // Higher limits disabled by default
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
    // No cleanup needed for current implementation
  }
}

// Export singleton instance
export const featureFlagService = new FeatureFlagService();

// Export types
export type { FeatureFlags, FeatureFlagConfig };
