import { BaseService, Params } from "thinkts";

function now(): Date { return new Date(); }

function normalizeJson(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return typeof value === "string" ? value : JSON.stringify(value);
}

export default class CampaignService extends BaseService {
  async beforeCreate(_ctx: unknown, data: Record<string, unknown>) {
    data.created_at = new Date();
    data.updated_at = new Date();
    data.device_scope_json = normalizeJson(data.device_scope_json);
    data.package_scope_json = normalizeJson(data.package_scope_json);
    data.rule_json = normalizeJson(data.rule_json);
    return data;
  }

  async beforeUpdate(_ctx: unknown, _id: unknown, data: Record<string, unknown>) {
    data.updated_at = new Date();
    if ("device_scope_json" in data) data.device_scope_json = normalizeJson(data.device_scope_json);
    if ("package_scope_json" in data) data.package_scope_json = normalizeJson(data.package_scope_json);
    if ("rule_json" in data) data.rule_json = normalizeJson(data.rule_json);
    return data;
  }

  @Params({ tenant_id: "int", id: "int" })
  async getById(opts: { tenant_id: number; id: number }) {
    const row = await this.findOne({ tenant_id: opts.tenant_id, id: opts.id });
    if (!row?.id) throw new Error("campaign not found");
    return row;
  }

  @Params({ tenant_id: "int", id: "int" })
  async publishCampaign(opts: { tenant_id: number; id: number }) {
    const row = await this.getById(opts);
    if (row.status === "archived") throw new Error("archived campaign cannot be published");
    await this.update({ tenant_id: opts.tenant_id, id: opts.id }, { status: "active", published_at: now() });
    return this.getById(opts);
  }

  @Params({ tenant_id: "int", id: "int" })
  async pauseCampaign(opts: { tenant_id: number; id: number }) {
    await this.getById(opts);
    await this.update({ tenant_id: opts.tenant_id, id: opts.id }, { status: "paused" });
    return this.getById(opts);
  }

  @Params({ tenant_id: "int" })
  async activeCampaigns(opts: { tenant_id: number; scene_code?: string }) {
    const tenant_id = opts.tenant_id;
    const where: Record<string, unknown> = { tenant_id, status: "active" };
    if (opts.scene_code) where.scene_code = opts.scene_code;
    const rows = await this.list(where);
    const current = Date.now();
    return rows.filter((row: Record<string, unknown>) => {
      const starts = row.start_at ? new Date(row.start_at as string).getTime() : 0;
      const ends = row.end_at ? new Date(row.end_at as string).getTime() : Number.POSITIVE_INFINITY;
      return starts <= current && ends >= current;
    });
  }
}
