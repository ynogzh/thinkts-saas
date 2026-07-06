import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device_category", {
  columns: {
    id: autoIncrement(t.string()),
    tenant_id: required(t.string()),
    code: required(t.string()),
    name: required(t.string()),
    description: nullable(t.string()),
    icon: nullable(t.string()),
    sort_order: required(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
