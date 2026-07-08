import { createSQLAdapter } from "thinkts";

const SQLAdapter = createSQLAdapter({
  adapter: "mysql",
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "thinkts_saas_demo",
  max: parseInt(process.env.DB_POOL_MAX || "2", 10),
  idleTimeout: 30,
  maxLifetime: 0,
});

export default {
  model: {
    type: "mysql",
    adapter: "mysql",
    prefix: "",
    pagesize: 10,
    handle: SQLAdapter,
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "thinkts_saas_demo",
  },
  cache: { type: "memory" },
  logger: { level: "info", console: true },
};
