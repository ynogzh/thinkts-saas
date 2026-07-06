import { BaseService } from "thinkts";

function normalizeJson(value) {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}


export default class SiteService extends BaseService {
  async beforeCreate(ctx, data) {
    data.created_at = new Date();
    data.updated_at = new Date();
    data.metadata_json = normalizeJson(data.metadata_json);
    return data;
  }

  async beforeUpdate(ctx, id, data) {
    data.updated_at = new Date();
    if ("metadata_json" in data) data.metadata_json = normalizeJson(data.metadata_json);
    return data;
  }

}
