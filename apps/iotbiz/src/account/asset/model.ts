import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * account_asset — 
 */
export default defineModel("account_asset", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    asset_type: label("资产类型")(listable(index(t.string()))),
    balance: label("Balance")(listable(t.decimal())),
    frozen_balance: label("Frozen Balance")(listable(t.decimal())),
    status: label("状态")(listable(searchable(t.string()))),
    version: label("版本")(listable(searchable(t.bigint()))),
    created_at: t.timestamp(),
    updated_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
