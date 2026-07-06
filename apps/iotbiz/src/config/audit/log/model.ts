import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_audit_log — 
 */
export default defineModel("config_audit_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(nullable(t.string()))),
    user_id: label("用户")(listable(searchable(nullable(t.bigint())))),
    event_type: label("Event Type")(listable(index(t.string()))),
    biz_type: label("业务类型")(listable(nullable(t.string()))),
    biz_id: label("业务ID")(listable(searchable(nullable(t.bigint())))),
    before_data: label("Before Data")(listable(nullable(t.json()))),
    after_data: label("After Data")(listable(nullable(t.json()))),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
