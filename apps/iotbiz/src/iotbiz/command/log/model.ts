import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_command_log — 
 */
export default defineModel("iotbiz_command_log", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    device_id: label("设备")(listable(searchable(index(t.bigint())))),
    session_id: label("会话")(listable(searchable(nullable(t.bigint())))),
    command_type: label("指令类型")(listable(t.string())),
    request_payload_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "请求参数", type: "string", default: "" }]),
    response_payload_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "响应参数", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
