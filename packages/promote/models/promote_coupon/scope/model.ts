import { defineModel, t, label, listable, searchable, primary, autoIncrement, required, nullable, index } from "thinkts";

export default defineModel("promote_coupon_scope", {
  columns: {
    id: required(autoIncrement(primary(t.bigint()))),
    tenant_id: label("租户")(searchable(listable(required(index(t.bigint()))))),
    template_id: listable(required(index(t.bigint()))),
    scope_type: listable(required(index(t.string()))),
    scope_value: listable(nullable(index(t.string()))),
    include_type: listable(required(t.string())),
    created_at: required(t.timestamp()),
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
