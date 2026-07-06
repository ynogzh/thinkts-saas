import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * operation_ad — 
 */
export default defineModel("operation_ad", {
  columns: {
    id: autoIncrement(primary(t.bigint())),
    tenant_id: label("租户")(listable(searchable(index(t.bigint())))),
    position_id: label("Position Id")(listable(searchable(index(t.bigint())))),
    title: label("标题")(listable(searchable(t.string()))),
    image_url: label("Image Url")(listable(nullable(t.string()))),
    target_type: label("Target Type")(listable(nullable(t.string()))),
    target_id: label("Target Id")(listable(searchable(nullable(t.bigint())))),
    target_url: label("Target Url")(listable(nullable(t.string()))),
    start_at: label("Start At")(listable(nullable(t.timestamp()))),
    end_at: label("End At")(listable(nullable(t.timestamp()))),
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
