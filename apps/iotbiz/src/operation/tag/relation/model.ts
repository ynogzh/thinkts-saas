import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * operation_tag_relation — 
 */
export default defineModel("operation_tag_relation", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    tag_id: label("Tag Id")(listable(searchable(index(t.bigint())))),
    biz_type: label("业务类型")(listable(index(t.string()))),
    biz_id: label("业务ID")(listable(searchable(index(t.bigint())))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
