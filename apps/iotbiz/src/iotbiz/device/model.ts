import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_device", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    device_no: label("设备编号")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    merchant_id: label("商户")(searchable(listable(required(index(t.bigint()))))),
    agent_id: label("代理")(listable(required(t.bigint()))),
    type_id: listable(required(t.bigint())),
    location_label: listable(nullable(t.string())),
    online_status: searchable(listable(required(t.string()))),
    start_mode: searchable(listable(required(t.string()))),
    pricing_json: nullable(t.json()),
    start_config_json: nullable(t.json()),
    last_heartbeat_at: listable(nullable(t.timestamp())),
    last_start_at: listable(nullable(t.timestamp())),
    status: label("状态")(searchable(listable(required(t.string())))),
    metadata_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
