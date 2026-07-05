import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_package_order", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    user_id: t.varchar(255).required(),
    package_id: t.varchar(255).required(),
    order_no: t.varchar(255).required(),
    quantity: t.varchar(255).required(),
    pay_amount: t.decimal().required(),
    trade_order_id: t.varchar(255).nullable(),
    payment_order_id: t.varchar(255).nullable(),
    status: t.varchar(255).required(),
    paid_at: t.timestamp().nullable(),
    created_at: t.timestamp().required(),
    updated_at: t.timestamp().required(),
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
