import type { MiddlewareConfig } from "thinkts";

export default {
  list: [],
  cors: {
    origin: "*",
    credentials: true,
  },
} as MiddlewareConfig;
