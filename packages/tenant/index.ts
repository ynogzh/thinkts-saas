import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "tenant",
  depends: [],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
