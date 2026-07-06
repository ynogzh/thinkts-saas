import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * permission_permission — 
 */
export default defineModel("permission_permission", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    module_code: label("模块编码")(listable(searchable(index(t.string())))),
    code: label("编码")(listable(searchable(index(unique(t.string()))))),
    name: label("名称")(listable(searchable(t.string()))),
    type: label("类型")(listable(searchable(t.string()))),
    parent_code: label("Parent Code")(listable(searchable(nullable(t.string())))),
    api_method: label("Api Method")(listable(nullable(t.string()))),
    api_path: label("Api Path")(listable(nullable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
