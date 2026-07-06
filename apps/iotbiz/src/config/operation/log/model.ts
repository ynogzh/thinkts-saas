import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_operation_log — 
 */
export default defineModel("config_operation_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(index(nullable(t.string())))),
    user_id: label("用户")(listable(searchable(nullable(t.bigint())))),
    action: label("Action")(listable(t.string())),
    biz_type: label("业务类型")(listable(index(nullable(t.string())))),
    biz_id: label("业务ID")(listable(searchable(index(nullable(t.bigint()))))),
    ip: label("IP")(listable(nullable(t.string()))),
    user_agent: label("User Agent")(listable(nullable(t.string()))),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
