import type { Plugin, PluginLoadContext } from "thinkts";
const plugin: Plugin = {
  name: "cms",
  depends: [],
  async load(ctx: PluginLoadContext) { ctx.scanDsl("./models"); ctx.scanModels("./models"); },
};
export default plugin;
