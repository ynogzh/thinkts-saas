import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "promote",
  depends: ["tenant"],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
