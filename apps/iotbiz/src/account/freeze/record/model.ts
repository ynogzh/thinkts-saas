import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * account_freeze_record — 
 */
export default defineModel("account_freeze_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    asset_type: label("资产类型")(listable(t.string())),
    biz_type: label("业务类型")(listable(t.string())),
    biz_id: label("业务ID")(listable(searchable(t.bigint()))),
    freeze_amount: label("Freeze Amount")(listable(t.decimal())),
    status: label("状态")(listable(searchable(index(t.string())))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
