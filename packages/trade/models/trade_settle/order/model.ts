import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * trade_settle_order — 
 */
export default defineModel("trade_settle_order", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    settle_no: label("Settle No")(listable(searchable(index(t.string())))),
    settle_type: label("Settle Type")(listable(searchable(t.string()))),
    receiver_type: label("接收方类型")(listable(searchable(t.string()))),
    receiver_id: label("Receiver Id")(listable(searchable(t.bigint()))),
    amount: label("金额")(listable(t.decimal())),
    status: label("状态")(listable(searchable(t.string()))),
    settled_at: label("Settled At")(listable(nullable(t.timestamp()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
