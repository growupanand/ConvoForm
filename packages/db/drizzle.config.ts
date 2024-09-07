import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema",
  out: "./drizzle/migrations",
  dbCredentials: {
    // biome-ignore lint/style/noNonNullAssertion: ignored
    url: process.env.DATABASE_URL!,
  },
  dialect: "postgresql",
  strict: true,
});
