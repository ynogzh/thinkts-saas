import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("iotbiz_command_log", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    device_id: required(t.string()),
    session_id: nullable(t.string()),
    command_type: required(t.string()),
    request_payload_json: nullable(t.string()),
    response_payload_json: nullable(t.string()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
