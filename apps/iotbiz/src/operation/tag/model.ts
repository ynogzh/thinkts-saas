import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * operation_tag — 
 */
export default defineModel("operation_tag", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(index(nullable(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    code: label("编码")(listable(searchable(nullable(t.string())))),
    color: label("Color")(listable(nullable(t.string()))),
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
