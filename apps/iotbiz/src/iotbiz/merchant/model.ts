import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("iotbiz_merchant", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    merchant_no: label("商户编号")(searchable(listable(required(index(t.string()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    agent_id: label("代理")(listable(required(index(t.bigint())))),
    contact_user_id: listable(nullable(t.bigint())),
    contact_name: listable(nullable(t.string())),
    contact_phone: listable(nullable(t.string())),
    merchant_share_rate: listable(required(t.string())),
    settlement_cycle: listable(required(t.string())),
    signed_at: listable(nullable(t.timestamp())),
    status: label("状态")(searchable(listable(required(t.string())))),
    extra_json: nullable(t.json()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
