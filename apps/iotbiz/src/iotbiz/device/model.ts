import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, index } from "thinkts";

export default defineModel("iotbiz_device", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    device_no: label("设备编号")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    merchant_id: label("商户")(listable(searchable(index(t.bigint())))),
    agent_id: label("代理")(listable(searchable(t.bigint()))),
    type_id: label("型号")(listable(searchable(t.bigint()))),
    location_label: label("位置")(listable(nullable(t.string()))),
    online_status: label("在线状态")(listable(searchable(t.string()))),
    start_mode: label("启动模式")(listable(searchable(t.string()))),
    pricing_json: nullable(t.json<{ mode: string; unit_price: number }>({
      jsonSchema: [
        { key: "mode", label: "计费模式", type: "string", default: "mock" },
        { key: "unit_price", label: "单价(分)", type: "number", default: 0 },
      ],
    })),
    start_config_json: nullable(t.json<{ command: string }>({
      jsonSchema: [
        { key: "command", label: "启动指令", type: "string", default: "" },
      ],
    })),
    last_heartbeat_at: label("最后心跳")(listable(nullable(t.timestamp()))),
    last_start_at: label("最后启动")(listable(nullable(t.timestamp()))),
    status: label("状态")(listable(searchable(t.string()))),
    metadata_json: nullable(t.json<{ notes: string }>({
      jsonSchema: [
        { key: "notes", label: "备注", type: "string", default: "" },
      ],
    })),
    created_at: t.timestamp(),
    updated_at: t.timestamp(),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
