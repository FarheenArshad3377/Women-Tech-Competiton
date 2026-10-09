import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error.message);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
export async function closePool() {
  await pool.end();
}
export default pool;
