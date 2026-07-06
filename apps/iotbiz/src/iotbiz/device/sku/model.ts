import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device_sku", {
  columns: {
    id: autoIncrement(t.string()),
    tenant_id: required(t.string()),
    category_id: required(t.string()),
    profile_id: required(t.string()),
    code: required(t.string()),
    name: required(t.string()),
    sale_mode: required(t.string()),
    price: required(t.decimal()),
    original_price: nullable(t.decimal()),
    package_quantity: nullable(t.string()),
    validity_days: nullable(t.string()),
    benefits_json: nullable(t.string()),
    extra_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
