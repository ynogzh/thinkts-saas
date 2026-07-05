import { Application } from "thinkts";
import { resolve } from "path";

const ROOT_PATH = import.meta.dir;
const packagesDir = resolve(ROOT_PATH, "../../packages");

const app = new Application({
  ROOT_PATH,
  packagesDir,
  env: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT || "8360"),
});

app.run().catch((err) => {
  console.error("Failed to start iotbiz:", err);
  process.exit(1);
});
