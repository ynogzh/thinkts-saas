import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "tenant",
  depends: [],

  async load(ctx: PluginLoadContext) {
    ctx.model("tenant_info", {
      tableName: "tenant_info",
      columns: [
        { name: "id", type: "bigint", primary: true, autoIncrement: true },
        { name: "code", type: "varchar", length: 64, required: true, unique: true },
        { name: "name", type: "varchar", length: 128, required: true },
        { name: "status", type: "tinyint", defaultTo: 1 },
        { name: "created_at", type: "datetime", defaultNow: true },
      ],
    });

    ctx.scanServices("./src/services");
    ctx.scanControllers("./src/controllers");
  },
};

export default plugin;
