import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_command_log", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    device_id: label("设备")(searchable(listable(required(index(t.bigint()))))),
    session_id: label("会话")(listable(nullable(t.bigint()))),
    command_type: listable(required(t.string())),
    request_payload_json: nullable(t.json()),
    response_payload_json: nullable(t.json()),
    status: label("状态")(searchable(listable(required(t.string())))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
