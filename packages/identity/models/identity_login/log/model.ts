import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("identity_login_log", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(nullable(index(t.bigint()))))),
    login_type: listable(required(t.string())),
    ip: listable(nullable(t.string())),
    user_agent: listable(nullable(t.string())),
    status: label("状态")(searchable(listable(required(t.string())))),
    fail_reason: listable(nullable(t.string())),
    created_at: required(index(t.timestamp())),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
