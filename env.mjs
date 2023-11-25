import zod from "zod";


// https://bharathvaj-ganesan.medium.com/adding-type-safety-to-environment-variables-in-nextjs-1ffebb4cf07d

const envSchema = zod.object({
  GOOGLE_CLIENT_ID: zod.string().min(1),
  GOOGLE_CLIENT_SECRET: zod.string().min(1),
  NEXT_AUTH_SECRET: zod.string().min(5),
});

export const env = envSchema.parse({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_AUTH_SECRET: process.env.NEXT_AUTH_SECRET,
});