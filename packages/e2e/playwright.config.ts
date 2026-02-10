import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Read from default .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : 1, // <-- some tests failing if workers are more than 1
  // Reporter to use.
  reporter: "html",
  timeout: 60000,

  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

    // Collect trace when retrying the failed test.
    trace: "on-first-retry",
    actionTimeout: 15000,
  },

  // Configure projects for major browsers
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     storageState: "playwright/.auth/user.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "webkit",
    //   use: {
    //     ...devices["Desktop Safari"],
    //     storageState: "playwright/.auth/user.json",
    //   },
    //   dependencies: ["setup"],
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: "pnpm --filter web run dev:turbo",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    cwd: path.resolve(__dirname, "../../"),
    env: {
      NEXT_PUBLIC_PACKAGE_ENV: "development",
    },
  },
});
