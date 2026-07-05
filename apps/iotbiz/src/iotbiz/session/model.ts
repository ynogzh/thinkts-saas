import { defineModel, t } from "thinkts";

export default defineModel("iotbiz_session", {
  columns: {
    id: t.varchar(255).primary().autoIncrement().required().index(),
    tenant_id: t.varchar(255).required().index(),
    session_no: t.varchar(255).required(),
    device_id: t.varchar(255).required(),
    merchant_id: t.varchar(255).required(),
    agent_id: t.varchar(255).required(),
    user_id: t.varchar(255).required(),
    consume_mode: t.varchar(255).required(),
    package_id: t.varchar(255).nullable(),
    entitlement_id: t.varchar(255).nullable(),
    trade_order_id: t.varchar(255).nullable(),
    payment_order_id: t.varchar(255).nullable(),
    unit_price: t.decimal().required(),
    quantity: t.varchar(255).required(),
    duration_seconds: t.varchar(255).nullable(),
    amount: t.decimal().required(),
    payable_amount: t.decimal().required(),
    status: t.varchar(255).required(),
    started_at: t.timestamp().nullable(),
    ended_at: t.timestamp().nullable(),
    finish_reason: t.varchar(255).nullable(),
    start_payload_json: t.varchar(255).nullable(),
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
