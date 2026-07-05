import { defineModel, t } from "thinkts";

export default defineModel("mall_order_item", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    order_id: t.varchar(255).required(),
    product_id: t.varchar(255).required(),
    product_name: t.varchar(255).required(),
    quantity: t.varchar(255).required(),
    price: t.decimal().required(),
    amount: t.decimal().required(),
    created_at: t.timestamp().required(),
  },

  hooks: {
    // beforeCreate(data, ctx) { return data; },
  },

  system: {
    // tenantAware: true,
  },

  access: {
    // admin: { create: true, read: true, update: true, delete: true },
  },
});
