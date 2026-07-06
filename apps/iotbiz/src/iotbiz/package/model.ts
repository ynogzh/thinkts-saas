import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_package", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    code: required(t.string()),
    name: required(t.string()),
    package_type: required(t.string()),
    sale_price: required(t.decimal()),
    recharge_amount: nullable(t.decimal()),
    bonus_amount: required(t.decimal()),
    total_times: nullable(t.string()),
    total_duration_seconds: nullable(t.string()),
    validity_days: nullable(t.string()),
    device_type_scope_json: nullable(t.string()),
    benefits_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
