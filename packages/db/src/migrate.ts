import { migrate } from "drizzle-orm/node-postgres/migrator";

import { db } from "./db";

async function main() {
  console.log("Running migrations");
  await migrate(db, { migrationsFolder: "drizzle/migrations" });
  console.log("Migrations finished");
}

main().catch((e) => {
  console.error("Error running migrations");
  console.error(e);
  process.exit(1);
});
