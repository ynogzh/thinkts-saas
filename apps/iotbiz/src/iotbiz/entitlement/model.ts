import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_entitlement", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(required(index(t.bigint()))))),
    package_id: listable(required(t.bigint())),
    package_order_id: listable(required(t.bigint())),
    package_type: listable(required(t.string())),
    granted_amount: listable(required(t.string())),
    used_amount: listable(required(t.string())),
    remaining_times: listable(required(t.bigint())),
    remaining_duration_seconds: listable(required(t.bigint())),
    expires_at: listable(nullable(t.timestamp())),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
