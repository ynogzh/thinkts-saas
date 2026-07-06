import { defineModel, t, primary, autoIncrement, required, nullable, index } from "thinkts";

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
    pricing_json: nullable(t.json<{
      mode: string
      unit_price: number
    }>({
      jsonSchema: [
        { key: "mode", label: "计费模式", type: "string", default: "mock" },
        { key: "unit_price", label: "单价(分)", type: "number", default: 0 },
      ],
    })),
    start_config_json: nullable(t.json<{
      command: string
    }>({
      jsonSchema: [
        { key: "command", label: "启动指令", type: "string", default: "" },
      ],
    })),
    last_heartbeat_at: nullable(t.timestamp()),
    last_start_at: nullable(t.timestamp()),
    status: required(t.string()),
    metadata_json: nullable(t.json<{
      notes: string
    }>({
      jsonSchema: [
        { key: "notes", label: "备注", type: "string", default: "" },
      ],
    })),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
