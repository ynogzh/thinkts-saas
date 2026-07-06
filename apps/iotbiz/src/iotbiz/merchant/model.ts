import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_merchant — 
 */
export default defineModel("iotbiz_merchant", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    merchant_no: label("商户编号")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    agent_id: label("代理")(listable(searchable(index(t.bigint())))),
    contact_user_id: label("联系人")(listable(searchable(nullable(t.bigint())))),
    contact_name: label("联系人")(listable(nullable(t.string()))),
    contact_phone: label("联系电话")(listable(nullable(t.string()))),
    merchant_share_rate: label("商户分成")(listable(t.decimal())),
    settlement_cycle: label("结算周期")(listable(t.string())),
    signed_at: label("签约时间")(listable(nullable(t.timestamp()))),
    status: label("状态")(listable(searchable(t.string()))),
    extra_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }]),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
