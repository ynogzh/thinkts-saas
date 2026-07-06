import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * permission_menu — 
 */
export default defineModel("permission_menu", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    module_code: label("模块编码")(listable(searchable(index(t.string())))),
    parent_id: label("父级")(listable(searchable(index(nullable(t.bigint()))))),
    name: label("名称")(listable(searchable(t.string()))),
    path: label("路径")(listable(nullable(t.string()))),
    component: label("Component")(listable(nullable(t.string()))),
    icon: label("图标")(listable(nullable(t.string()))),
    permission_code: label("Permission Code")(listable(searchable(nullable(t.string())))),
    sort: label("排序")(listable(searchable(t.bigint()))),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
  },

  access: {},
});
