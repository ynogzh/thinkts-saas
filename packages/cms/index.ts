import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "cms",
  depends: ["tenant"],
  async load(ctx: PluginLoadContext) {
    ctx.scanDsl("models");
  },
};

export default plugin;
