import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * iotbiz_device_category — 
 */
export default defineModel("iotbiz_device_category", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    code: label("编码")(listable(searchable(index(t.string())))),
    name: label("名称")(listable(searchable(t.string()))),
    description: label("描述")(listable(nullable(t.string()))),
    icon: label("图标")(listable(nullable(t.string()))),
    sort_order: label("排序")(listable(searchable(t.bigint()))),
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
