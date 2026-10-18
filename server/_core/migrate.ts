import { migrate } from "drizzle-orm/mysql2/migrator";
import { getDb } from "../db";

// Set RUN_MIGRATIONS=true on the host to create/update the tables automatically at startup.
// Only pending migrations from ./drizzle are applied, so it is safe to leave on.
export async function runMigrationsIfRequested() {
  if (process.env.RUN_MIGRATIONS !== "true") return;
  const db = await getDb();
  if (!db) throw new Error("RUN_MIGRATIONS=true but DATABASE_URL is missing or invalid");
  console.log("[Database] Applying pending migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[Database] Migrations complete.");
}
