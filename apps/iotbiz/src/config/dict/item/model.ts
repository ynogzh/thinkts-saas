import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_dict_item — 
 */
export default defineModel("config_dict_item", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    dict_code: label("Dict Code")(listable(index(t.string()))),
    item_label: label("Item Label")(listable(t.string())),
    item_value: label("Item Value")(listable(t.string())),
    sort: label("排序")(listable(searchable(t.bigint()))),
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
