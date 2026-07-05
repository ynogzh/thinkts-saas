import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "permission",
  depends: ["tenant", "identity"],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
