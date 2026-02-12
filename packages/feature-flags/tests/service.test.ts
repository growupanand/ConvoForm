import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { FeatureFlagService } from "../src/index";

// Mock PostHog
const mockIsFeatureEnabled = mock(() => Promise.resolve(true));
const mockGetAllFlags = mock(() =>
  Promise.resolve({ "file-upload-beta": true }),
);
const mockShutdown = mock(() => Promise.resolve());

mock.module("posthog-node", () => {
  return {
    PostHog: class {
      isFeatureEnabled = mockIsFeatureEnabled;
      getAllFlags = mockGetAllFlags;
      shutdown = mockShutdown;
    },
  };
});

describe("FeatureFlagService", () => {
  let service: FeatureFlagService;

  // Mock environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "test-key";
    process.env.NEXT_PUBLIC_POSTHOG_HOST = "http://localhost";

    // Clear mocks
    mockIsFeatureEnabled.mockClear();
    mockGetAllFlags.mockClear();

    // Create new service instance (this will use the mocked PostHog)
    service = new FeatureFlagService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return default value when PostHog client is not initialized", async () => {
    // Unset API key to simulate no client
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "";
    const localService = new FeatureFlagService();

    const result = await localService.isFeatureEnabled("file-upload-beta", {
      distinctId: "user-123",
    });

    expect(result).toBe(true); // Default for beta is true in our code
    expect(mockIsFeatureEnabled).not.toHaveBeenCalled();
  });

  it("should call PostHog and cache the result", async () => {
    mockIsFeatureEnabled.mockResolvedValueOnce(false);

    const config = { distinctId: "user-123" };

    // First call - should hit API
    const result1 = await service.isFeatureEnabled("file-upload-beta", config);
    expect(result1).toBe(false);
    expect(mockIsFeatureEnabled).toHaveBeenCalledTimes(1);

    // Second call - should hit cache
    const result2 = await service.isFeatureEnabled("file-upload-beta", config);
    expect(result2).toBe(false);
    expect(mockIsFeatureEnabled).toHaveBeenCalledTimes(1);
  });

  it("should handle cache expiration (simulated)", async () => {
    mockIsFeatureEnabled.mockResolvedValue(true);

    const config = { distinctId: "user-123" };

    // First call
    await service.isFeatureEnabled("file-upload-beta", config);
    expect(mockIsFeatureEnabled).toHaveBeenCalledTimes(1);

    // Manually manipulate cache (internal access via any)
    const cache = (service as any).cache;
    const cacheKey = "file-upload-beta:user-123";

    // Set timestamp to old value
    cache.set(cacheKey, {
      value: true,
      timestamp: Date.now() - 6 * 60 * 1000, // 6 minutes ago
    });

    // Second call - should hit API again because cache expired
    await service.isFeatureEnabled("file-upload-beta", config);
    expect(mockIsFeatureEnabled).toHaveBeenCalledTimes(2);
  });

  it("should fallback to default on error", async () => {
    mockIsFeatureEnabled.mockRejectedValueOnce(new Error("API Error"));

    const result = await service.isFeatureEnabled("file-upload-beta", {
      distinctId: "user-123",
    });

    expect(result).toBe(true); // Default value
  });

  it("should get all feature flags", async () => {
    mockGetAllFlags.mockResolvedValueOnce({
      "file-upload-beta": false,
      "file-upload-admin": true,
    });

    const flags = await service.getAllFeatureFlags({ distinctId: "user-123" });

    expect(flags["file-upload-beta"]).toBe(false);
    expect(flags["file-upload-admin"]).toBe(true);
    expect(flags["increased-storage-limits"]).toBe(false); // Default
  });
});
