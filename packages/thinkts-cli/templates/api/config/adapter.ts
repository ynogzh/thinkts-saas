import { createSQLAdapter, createRedisAdapter } from "thinkts";
import { getThink } from "thinkts";

const think = getThink();

const SQLAdapter = createSQLAdapter({
  adapter: "mysql",
  host: think?.envVar("DB_HOST") ?? process.env.DB_HOST ?? "127.0.0.1",
  port: think?.envInt("DB_PORT") ?? parseInt(process.env.DB_PORT || "3306", 10),
  user: think?.envVar("DB_USER") ?? process.env.DB_USER ?? "root",
  password: think?.envVar("DB_PASSWORD") ?? process.env.DB_PASSWORD ?? "",
  database: think?.envVar("DB_NAME") ?? process.env.DB_NAME ?? "thinkts",
  max: 10,
  idleTimeout: 30,
  maxLifetime: 0,
});

const RedisAdapter = createRedisAdapter({
  host: think?.envVar("REDIS_HOST") ?? process.env.REDIS_HOST ?? "127.0.0.1",
  port: think?.envInt("REDIS_PORT") ?? parseInt(process.env.REDIS_PORT || "6379", 10),
  db: think?.envInt("REDIS_DB") ?? parseInt(process.env.REDIS_DB || "0", 10),
  password: think?.envVar("REDIS_PASSWORD") ?? process.env.REDIS_PASSWORD,
});

export default {
  model: {
    type: "mysql",
    adapter: "mysql",
    prefix: "",
    pagesize: 10,
    handle: SQLAdapter,
    host: think?.envVar("DB_HOST") ?? process.env.DB_HOST ?? "127.0.0.1",
    port: think?.envInt("DB_PORT") ?? parseInt(process.env.DB_PORT || "3306", 10),
    user: think?.envVar("DB_USER") ?? process.env.DB_USER ?? "root",
    password: think?.envVar("DB_PASSWORD") ?? process.env.DB_PASSWORD ?? "",
    database: think?.envVar("DB_NAME") ?? process.env.DB_NAME ?? "thinkts",
  },
  cache: {
    type: "redis",
    handle: RedisAdapter,
    host: think?.envVar("REDIS_HOST") ?? process.env.REDIS_HOST ?? "127.0.0.1",
    port: think?.envInt("REDIS_PORT") ?? parseInt(process.env.REDIS_PORT || "6379", 10),
    password: think?.envVar("REDIS_PASSWORD") ?? process.env.REDIS_PASSWORD,
    db: think?.envInt("REDIS_DB") ?? parseInt(process.env.REDIS_DB || "0", 10),
  },
  logger: {
    level: "info",
    console: true,
    file: "./runtime/app.log",
    maxSize: 50 * 1024 * 1024,
    maxFiles: 7,
  },
};
