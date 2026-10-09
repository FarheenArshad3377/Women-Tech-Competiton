import app from "./app.js";
import { env } from "./config/env.js";
import { closePool } from "./config/db.js";

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; shutting down...`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
