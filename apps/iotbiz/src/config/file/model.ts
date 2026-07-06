import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * config_file — 
 */
export default defineModel("config_file", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    module_code: label("模块编码")(listable(nullable(t.string()))),
    biz_type: label("业务类型")(listable(index(nullable(t.string())))),
    biz_id: label("业务ID")(listable(searchable(index(nullable(t.bigint()))))),
    file_name: label("File Name")(listable(t.string())),
    file_url: label("File Url")(listable(t.string())),
    file_type: label("File Type")(listable(nullable(t.string()))),
    file_size: label("File Size")(listable(searchable(nullable(t.bigint())))),
    storage_provider: label("Storage Provider")(listable(nullable(t.string()))),
    created_by: label("Created By")(listable(searchable(nullable(t.bigint())))),
    created_at: t.timestamp()
  },

  hooks: {},

  system: {
    tenantAware: true,
  },

  access: {},
});
