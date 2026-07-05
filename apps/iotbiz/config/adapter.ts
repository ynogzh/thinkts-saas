import { join } from "path";

const isDev = process.env.NODE_ENV !== "production";
const dbType = process.env.DB_TYPE ?? (isDev ? "sqlite" : "mysql");

let adapterClass: unknown;
let modelConfig: Record<string, unknown>;

if (dbType === "sqlite") {
  const dbPath = process.env.DB_PATH ?? join(import.meta.dir, ".data", "thinkts.db");
  const { Database } = await import("bun:sqlite");
  const conn = new Database(dbPath, { create: true });
  conn.run("PRAGMA journal_mode=WAL");
  conn.run("PRAGMA foreign_keys=ON");

  adapterClass = class {
    db() { return conn; }
  };

  modelConfig = { type: "sqlite", adapter: "sqlite", handle: adapterClass };
} else {
  const { createSQLAdapter } = await import("thinkts");
  adapterClass = createSQLAdapter({
    adapter: "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "thinkts_saas_dev",
    max: 10,
    idleTimeout: 30,
    maxLifetime: 0,
  });
  modelConfig = {
    type: "mysql", adapter: "mysql", handle: adapterClass,
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "thinkts_saas_dev",
  };
}

export default {
  model: modelConfig,
  cache: { type: "memory" },
  logger: { level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"), console: true },
};
