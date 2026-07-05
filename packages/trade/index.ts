import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "trade",
  depends: ["tenant", "identity"],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
