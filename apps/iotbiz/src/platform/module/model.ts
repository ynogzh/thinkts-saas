import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * platform_module — 
 */
export default defineModel("platform_module", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    code: label("编码")(listable(searchable(index(unique(t.string()))))),
    name: label("名称")(listable(searchable(t.string()))),
    level1: label("Level1")(listable(t.string())),
    type: label("类型")(listable(t.string())),
    version: label("版本")(listable(nullable(t.string()))),
    status: label("状态")(listable(searchable(t.string()))),
    description: label("描述")(listable(nullable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
