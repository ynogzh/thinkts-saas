import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("mall_product", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    name: label("名称")(searchable(listable(required(t.string())))),
    price: label("单价")(listable(required(t.string()))),
    status: label("状态")(searchable(listable(required(index(t.string()))))),
    created_at: required(t.timestamp()),
    updated_at: required(t.timestamp()),
    deleted_at: nullable(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
    softDelete: true,
  },

  access: {},
});
