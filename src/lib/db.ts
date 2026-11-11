import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

declare global { var adpulsePool: Pool | undefined; }

function createPool(): Pool {
  const url = process.env.DATABASE_URL;
  if (url) return mysql.createPool(url);
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } = process.env;
  if (!DB_HOST || ! DB_USER || !DB_DATABASE) throw new Error("Database is not configured");
  return mysql.createPool({ host: DB_HOST, port: Number(DB_PORT || 3306), user: DB_USER, password: DB_PASSWORD, database: DB_DATABASE, waitForConnections: true, connectionLimit: 12, maxIdle: 6, idleTimeout: 60_000, enableKeepAlive: true, timezone: "Z" });
}

export const db = globalThis.adpulsePool ?? createPool();
if (process.env.NODE_ENV !== "production") globalThis.adpulsePool = db;

export async function rows<T extends RowDataPacket = RowDataPacket>(sql: string, values: unknown[] = []): Promise<T[]> {
  const [result] = await db.execute<T[]>(sql, values);
  return result;
}
