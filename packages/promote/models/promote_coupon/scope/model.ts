import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_coupon_scope — 
 */
export default defineModel("promote_coupon_scope", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    template_id: label("模板")(listable(searchable(index(t.bigint())))),
    scope_type: label("范围类型")(listable(searchable(index(t.string())))),
    scope_value: label("Scope Value")(listable(index(nullable(t.string())))),
    include_type: label("包含类型")(listable(searchable(t.string()))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
