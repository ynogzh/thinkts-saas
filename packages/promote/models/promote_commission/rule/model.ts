import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * promote_commission_rule — 
 */
export default defineModel("promote_commission_rule", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    biz_type: label("业务类型")(listable(searchable(index(t.string())))),
    level_id: label("等级")(listable(searchable(index(t.bigint())))),
    rate: label("比率")(listable(t.decimal())),
    condition_json: nullable(t.json()),  // jsonSchema(t.json(), [{ key: "condition_type", label: "条件类型", type: "string", default: "" }]),
    status: label("状态")(listable(searchable(t.string()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
