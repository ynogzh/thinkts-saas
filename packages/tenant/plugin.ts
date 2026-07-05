import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "tenant",
  depends: [],

  async load(ctx: PluginLoadContext) {
    // Scan DSL models (model.json, table.json, acl.json, service.js)
    ctx.scanDsl("./models");
    ctx.scanModels("./models");
  },
};

export default plugin;
