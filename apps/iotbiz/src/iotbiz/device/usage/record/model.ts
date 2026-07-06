import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_device_usage_record", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    user_id: label("用户")(searchable(listable(required(index(t.bigint()))))),
    device_id: label("设备")(searchable(listable(required(index(t.bigint()))))),
    category_id: listable(required(index(t.bigint()))),
    session_id: label("会话")(listable(required(index(t.bigint())))),
    sku_id: listable(nullable(t.bigint())),
    usage_type: listable(required(t.string())),
    amount: label("金额")(listable(required(t.string()))),
    started_at: listable(required(t.timestamp())),
    finished_at: listable(nullable(t.timestamp())),
    extra_json: nullable(t.json()),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
