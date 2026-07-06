import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_entitlement", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    user_id: required(t.string()),
    package_id: required(t.string()),
    package_order_id: required(t.string()),
    package_type: required(t.string()),
    granted_amount: required(t.decimal()),
    used_amount: required(t.decimal()),
    remaining_times: required(t.string()),
    remaining_duration_seconds: required(t.string()),
    expires_at: nullable(t.timestamp()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
