import { BaseService, Params } from "thinkts";

export default class CampaignService extends BaseService {
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
    await this.update(
      { tenant_id: opts.tenant_id, id: opts.id },
      { status: "active", published_at: new Date() },
    );
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
    const where: Record<string, unknown> = { tenant_id: opts.tenant_id, status: "active" };
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
