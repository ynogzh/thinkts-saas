import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("mall_order_item", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    order_id: label("订单")(listable(required(index(t.bigint())))),
    product_id: label("商品")(listable(required(t.bigint()))),
    product_name: listable(required(t.string())),
    quantity: label("数量")(listable(required(t.bigint()))),
    price: label("单价")(listable(required(t.string()))),
    amount: label("金额")(listable(required(t.string()))),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
