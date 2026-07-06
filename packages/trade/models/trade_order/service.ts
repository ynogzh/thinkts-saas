import { BaseService, Params } from "thinkts";



export default class Trade_orderService extends BaseService {
  async createOrder(opts, think) {
    if (!opts.tenant_id) throw new Error("tenant_id is required");
    if (!opts.biz_type) throw new Error("biz_type is required");
    if (!opts.biz_id) throw new Error("biz_id is required");
    if (!opts.user_id) throw new Error("user_id is required");
    if (opts.amount === undefined) throw new Error("amount is required");
  
    const tenantId = Number(opts.tenant_id);
    const order_no = "T" + Date.now() + Math.floor(1000 + Math.random() * 9000);
    const pay_amount = opts.pay_amount ?? opts.amount;
    const discount_amount = opts.discount_amount ?? 0;
  
    const order = await this.create({
      tenant_id: tenantId,
      order_no,
      biz_type: opts.biz_type,
      biz_id: opts.biz_id,
      user_id: opts.user_id,
      amount: Number(opts.amount),
      discount_amount: Number(discount_amount),
      pay_amount: Number(pay_amount),
      status: "created",
    });
  
    if (opts.items && Array.isArray(opts.items)) {
      const itemModel = this.model("trade_order_item");
      for (const it of opts.items) {
        await itemModel.create({
          tenant_id: tenantId,
          trade_order_id: order.id,
          item_type: it.item_type || "product",
          item_id: it.item_id,
          item_name: it.item_name || "",
          quantity: Number(it.quantity),
          price: Number(it.price),
          amount: Number(it.amount ?? it.price * it.quantity),
        });
      }
    }
  
    return order;
  }

  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const order = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!order?.id) throw new NotFoundError("trade order not found");
    return order;
  }

  async getPayableOrder(opts, think) {
    const order = await think.service("trade.order.getById", {
      tenant_id: Number(opts.tenant_id),
      id: Number(opts.order_id ?? opts.id),
    });
    if (["paid", "closed", "cancelled", "refunded"].includes(String(order.status ?? ""))) {
      throw new ForbiddenError(`trade order is not payable: ${String(order.status)}`);
    }
    return order;
  }

  async markPaid(opts, think) {
    if (!opts.tenant_id) throw new Error("tenant_id is required");
    if (!opts.order_id) throw new Error("order_id is required");
  
    const order = await think.service("trade.order.getById", {
      tenant_id: Number(opts.tenant_id),
      id: Number(opts.order_id),
    });
  
    await this.update({ id: order.id, tenant_id: Number(opts.tenant_id) }, {
      status: "paid",
      paid_at: new Date(),
    });
  
    return await this.findOne({ id: order.id, tenant_id: Number(opts.tenant_id) });
  }

  @Params({ tenant_id: "int", order_id: "int" })
  async markRefunded(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.order_id) throw new Error("order_id is required");
    const order = await think.service("trade.order.getById", {
      tenant_id: Number(opts.tenant_id),
      id: Number(opts.order_id),
    });
    await this.update({ id: order.id, tenant_id: Number(opts.tenant_id) }, {
      status: "refunded",
      updated_at: new Date(),
    });
    return await this.findOne({ id: order.id, tenant_id: Number(opts.tenant_id) });
  }

}
