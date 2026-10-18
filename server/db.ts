import { desc, eq } from "drizzle-orm";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import { customerQueries, InsertCustomerQuery, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { mysqlOptionsFromUrl } from "./_core/dbConfig";

let _db: MySql2Database<Record<string, unknown>> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = createPool({ ...mysqlOptionsFromUrl(process.env.DATABASE_URL), connectionLimit: 5 });
      _db = drizzle({ client: pool });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomerQuery(input: InsertCustomerQuery) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(customerQueries).values(input);
  return Number(result[0].insertId);
}

export async function listCustomerQueries(status?: "new" | "in_progress" | "resolved") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const query = db.select().from(customerQueries).orderBy(desc(customerQueries.createdAt));
  if (status) return query.where(eq(customerQueries.status, status));
  return query;
}

export async function updateCustomerQuery(
  id: number,
  input: { status: "new" | "in_progress" | "resolved"; internalNotes?: string | null },
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(customerQueries).set(input).where(eq(customerQueries.id, id));
}

export async function deleteCustomerQuery(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(customerQueries).where(eq(customerQueries.id, id));
}
