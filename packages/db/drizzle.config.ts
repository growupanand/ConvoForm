import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  strict: true,
});
