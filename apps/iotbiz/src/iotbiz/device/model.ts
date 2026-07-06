import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_device", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    device_no: required(t.string()),
    name: required(t.string()),
    merchant_id: required(t.string()),
    agent_id: required(t.string()),
    type_id: required(t.string()),
    location_label: nullable(t.string()),
    online_status: required(t.string()),
    start_mode: required(t.string()),
    pricing_json: nullable(t.string()),
    start_config_json: nullable(t.string()),
    last_heartbeat_at: nullable(t.timestamp()),
    last_start_at: nullable(t.timestamp()),
    status: required(t.string()),
    metadata_json: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
