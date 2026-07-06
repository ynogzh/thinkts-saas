import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * account_asset_record — 
 */
export default defineModel("account_asset_record", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    asset_type: label("资产类型")(listable(index(t.string()))),
    biz_type: label("业务类型")(listable(index(t.string()))),
    biz_id: label("业务ID")(listable(searchable(index(t.bigint())))),
    change_type: label("Change Type")(listable(t.string())),
    change_amount: label("Change Amount")(listable(t.decimal())),
    balance_after: label("Balance After")(listable(t.decimal())),
    created_at: index(t.timestamp())
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
