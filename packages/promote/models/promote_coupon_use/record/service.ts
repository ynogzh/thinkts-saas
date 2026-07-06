import { BaseService, Params } from "thinkts";

export default class RecordService extends BaseService {
  @Params({ tenant_id: "int", user_coupon_id: "int", user_id: "int", biz_type: "int", biz_id: "int" })
  async createUseRecord(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.user_coupon_id) throw new Error("user_coupon_id is required");
    if (!opts?.user_id) throw new Error("user_id is required");
    if (!opts?.biz_type) throw new Error("biz_type is required");
    if (!opts?.biz_id) throw new Error("biz_id is required");
    if (opts?.discount_amount === undefined) throw new Error("discount_amount is required");
    return await this.create({
      tenant_id: Number(opts.tenant_id),
      user_coupon_id: Number(opts.user_coupon_id),
      user_id: Number(opts.user_id),
      biz_type: String(opts.biz_type),
      biz_id: Number(opts.biz_id),
      discount_amount: Number(opts.discount_amount),
      status: "used",
      used_at: new Date(),
    });
  }

}
