import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("permission_permission", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    module_code: listable(required(index(t.string()))),
    code: label("编码")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    type: label("类型")(listable(required(t.string()))),
    parent_code: listable(nullable(t.string())),
    api_method: listable(nullable(t.string())),
    api_path: listable(nullable(t.string())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
