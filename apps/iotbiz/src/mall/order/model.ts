import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("mall_order", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    order_no: required(t.string()),
    user_id: required(t.string()),
    amount: required(t.decimal()),
    status: required(t.string()),
    owner_user_id: nullable(t.string()),
    dept_id: nullable(t.string()),
    agent_id: nullable(t.string()),
    channel_id: nullable(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
