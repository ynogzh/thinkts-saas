import { BaseService, Params } from "thinkts";

export default class TemplateService extends BaseService {
  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!row?.id) throw new Error("coupon template not found");
    return row;
  }

  @Params({ tenant_id: "int", id: "int" })
  async decrementRemaining(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const tenant_id = Number(opts.tenant_id);
    const id = Number(opts.id);
    const row = await getById.call(this, { tenant_id, id });
    if (row.remaining_quantity == null) return row;
    const remaining = Number(row.remaining_quantity);
    if (remaining <= 0) throw new Error("coupon template has no remaining quantity");
    await this.update({ tenant_id, id }, { remaining_quantity: remaining - 1 });
    return await getById.call(this, { tenant_id, id });
  }

  @Params({ tenant_id: "int", template_id: "int", user_id: "int" })
  async issueCoupon(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.template_id) throw new Error("template_id is required");
    if (!opts?.user_id) throw new Error("user_id is required");
    return await think.service("promote.user.coupon.issueFromTemplate", opts);
  }

}
