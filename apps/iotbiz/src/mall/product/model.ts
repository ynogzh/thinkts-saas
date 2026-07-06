import { defineModel, t, primary, autoIncrement, required, nullable, unique, index, defaultTo, comment } from "thinkts";

export default defineModel("mall_product", {
  columns: {
    id: index(primary(autoIncrement(t.string()))),
    tenant_id: required(index(t.string())),
    name: required(t.string()),
    price: required(t.decimal()),
    status: required(t.string()),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp()),
  },

  hooks: {},

  system: {},

  access: {},
});
