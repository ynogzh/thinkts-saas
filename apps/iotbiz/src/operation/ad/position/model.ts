import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * operation_ad_position — 
 */
export default defineModel("operation_ad_position", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    platform: label("Platform")(listable(nullable(t.string()))),
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
