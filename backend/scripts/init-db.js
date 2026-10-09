import { readFile } from "node:fs/promises";
import { query, closePool } from "../src/config/db.js";

try {
  const sql = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
  await query(sql);
  console.log("Database schema initialized.");
} catch (error) {
  console.error("Database initialization failed:", error.message);
  process.exitCode = 1;
} finally {
  await closePool();
}
