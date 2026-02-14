import { aiEnvSchema } from "@convoform/ai/src/envSchema";
import { apiEnvSchema } from "@convoform/api/src/envSchema";
import { databaseEnvSchema } from "@convoform/db/src/envSchema";
import { emailEnvSchema } from "@convoform/email/src/envSchema";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  extends: [databaseEnvSchema, aiEnvSchema, emailEnvSchema, apiEnvSchema],
  server: {
    CLERK_SECRET_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_REDIRECT_URI: z.url().optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    POSTHOG_API_KEY: z.string().min(1).optional(),
    POSTHOG_ENV_ID: z.string().min(1).optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.url().optional(),
    NEXT_PUBLIC_WEBSOCKET_URL: z.url().optional(),
    // Shared envs from api
    NEXT_PUBLIC_APP_URL: apiEnvSchema.NEXT_PUBLIC_APP_URL,
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  // If you're using Next.js >= 13.4.4, you can just destructure process.env
  experimental__runtimeEnv: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
