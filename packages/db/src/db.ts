import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

/**
 * Create a database client with its own connection pool.
 *
 * The shared `db` below is a module-level pool and is safe on the Node.js
 * runtime. Create a fresh client when a pooled connection failed or hung, and
 * call `pool.end()` once the operation is done.
 */
export function createDb() {
  const db = drizzle({
    schema,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    connection: process.env.DATABASE_URL!,
    ws: WebSocket,
  });

  return {
    db,
    pool: db.$client,
  };
}

const defaultDb = createDb();

export const db = defaultDb.db;
