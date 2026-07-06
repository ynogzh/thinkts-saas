import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * content_category — 
 */
export default defineModel("content_category", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(searchable(nullable(t.string())))),
    parent_id: label("父级")(listable(searchable(nullable(t.bigint())))),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(index(nullable(t.string()))))),
    sort: label("排序")(listable(searchable(t.bigint()))),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
