import type { Plugin, PluginLoadContext } from "thinkts";
const plugin: Plugin = {
  name: "promote",
  depends: ["identity", "trade", "payment"],
  async load(ctx: PluginLoadContext) { ctx.scanDsl("./models"); ctx.scanModels("./models"); },
};
export default plugin;
