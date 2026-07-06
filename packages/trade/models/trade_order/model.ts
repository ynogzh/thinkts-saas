import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("trade_order", {
  columns: {
    id: index(primary(autoIncrement(t.bigint()))),
    tenant_id: label("租户")(searchable(index(required(t.bigint())))),
    order_no: label("订单号")(listable(searchable(required(t.string())))),
    biz_type: label("业务类型")(listable(required(t.string()))),
    biz_id: label("业务ID")(listable(t.bigint())),
    user_id: label("用户")(searchable(listable(t.bigint()))),
    amount: label("金额")(listable(required(t.decimal()))),
    discount_amount: label("折扣金额")(listable(t.decimal())),
    pay_amount: label("支付金额")(listable(required(t.decimal()))),
    status: label("状态")(listable(searchable(t.string()))),
    paid_at: label("支付时间")(nullable(t.timestamp())),
    closed_at: label("关闭时间")(nullable(t.timestamp())),
    created_at: label("创建时间")(required(t.timestamp())),
    updated_at: label("更新时间")(required(t.timestamp())),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {
    superadmin: ["create", "read", "update", "delete"],
    admin: ["create", "read", "update", "delete"],
    user: ["read"],
  },
});
