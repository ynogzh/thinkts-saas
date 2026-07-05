import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "payment",
  depends: ["tenant", "trade"],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
