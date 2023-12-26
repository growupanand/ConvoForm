const z = require("zod");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPEN_AI_MODEL: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
});



// https://bharathvaj-ganesan.medium.com/adding-type-safety-to-environment-variables-in-nextjs-1ffebb4cf07d

const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  OPEN_AI_MODEL: process.env.OPEN_AI_MODEL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
});

module.exports = { env };