import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * identity_login_log — 
 */
export default defineModel("identity_login_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(nullable(t.bigint()))))),
    login_type: label("登录类型")(listable(t.string())),
    ip: label("IP")(listable(nullable(t.string()))),
    user_agent: label("User Agent")(listable(nullable(t.string()))),
    status: label("状态")(listable(searchable(t.string()))),
    fail_reason: label("失败原因")(listable(nullable(t.string()))),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
