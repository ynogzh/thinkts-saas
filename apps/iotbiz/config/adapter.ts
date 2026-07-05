import { createSQLAdapter, createRedisAdapter } from "thinkts";

const SQLAdapter = createSQLAdapter({
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

const RedisAdapter = createRedisAdapter({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  db: parseInt(process.env.REDIS_DB || "0", 10),
  password: process.env.REDIS_PASSWORD,
});

export default {
  model: {
    type: "mysql",
    adapter: "mysql",
    handle: SQLAdapter,
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "thinkts_saas_dev",
  },
  cache: {
    type: "redis",
    handle: RedisAdapter,
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },
  logger: {
    level: "info",
    console: true,
  },
};
