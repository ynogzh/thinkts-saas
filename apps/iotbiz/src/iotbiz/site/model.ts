import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_site", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    site_no: required(t.string()),
    name: required(t.string()),
    merchant_id: required(t.string()),
    agent_id: required(t.string()),
    address: nullable(t.string()),
    location_label: nullable(t.string()),
    latitude: nullable(t.decimal()),
    longitude: nullable(t.decimal()),
    contact_name: nullable(t.string()),
    contact_phone: nullable(t.string()),
    device_capacity: required(t.string()),
    status: required(t.string()),
    metadata_json: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
