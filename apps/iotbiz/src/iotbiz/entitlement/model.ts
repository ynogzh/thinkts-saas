import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_entitlement — 
 */
export default defineModel("iotbiz_entitlement", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    user_id: label("用户")(listable(searchable(index(t.bigint())))),
    package_id: label("Package Id")(listable(searchable(t.bigint()))),
    package_order_id: label("套餐订单")(listable(searchable(t.bigint()))),
    package_type: label("套餐类型")(listable(t.string())),
    granted_amount: label("授权金额")(listable(t.decimal())),
    used_amount: label("已用金额")(listable(t.decimal())),
    remaining_times: label("剩余次数")(listable(searchable(t.bigint()))),
    remaining_duration_seconds: label("Remaining Duration Seconds")(listable(searchable(t.bigint()))),
    expires_at: label("Expires At")(listable(nullable(t.timestamp()))),
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
