import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("trade_settle_order", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    settle_no: listable(required(index(t.string()))),
    settle_type: listable(required(t.string())),
    receiver_type: listable(required(t.string())),
    receiver_id: listable(required(t.bigint())),
    amount: label("金额")(listable(required(t.string()))),
    status: label("状态")(searchable(listable(required(t.string())))),
    settled_at: listable(nullable(t.timestamp())),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
