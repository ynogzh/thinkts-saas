import type { Plugin, PluginLoadContext } from "thinkts";
const plugin: Plugin = {
  name: "payment",
  depends: ["trade"],
  async load(ctx: PluginLoadContext) { ctx.scanDsl("./models"); ctx.scanModels("./models"); },
};
export default plugin;
