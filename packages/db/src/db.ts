import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
export const db = drizzle({
  schema,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  connection: process.env.DATABASE_URL!,
  ws: WebSocket,
});
