import { BaseService, Params } from "thinkts";

function buildOrderNo() {
  return `PK${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}


export default class OrderService extends BaseService {
  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.id) throw new Error("id is required");
    const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!row?.id) throw new Error("package order not found");
    return row;
  }

  @Params({ tenant_id: "int", user_id: "int", package_id: "int" })
  async createOrder(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.user_id) throw new Error("user_id is required");
    if (!opts?.package_id) throw new Error("package_id is required");
    const tenant_id = Number(opts.tenant_id);
    const pkg = await think.service("iotbiz.package.getById", { tenant_id, id: Number(opts.package_id) });
    const quantity = Number(opts.quantity ?? 1);
    const amount = Number(pkg.sale_price) * quantity;
    const order = await this.create({
      tenant_id,
      user_id: Number(opts.user_id),
      package_id: Number(pkg.id),
      order_no: String(opts.order_no || buildOrderNo()),
      quantity,
      pay_amount: amount,
      status: "created",
    });
    const tradeOrder = await think.service("trade.order.createOrder", {
      tenant_id,
      biz_type: "iotbiz_package_order",
      biz_id: Number(order.id),
      user_id: Number(opts.user_id),
      amount,
      pay_amount: amount,
    });
    const paymentOrder = await think.service("payment.order.createPay", {
      tenant_id,
      trade_order_id: Number(tradeOrder.id),
      biz_type: "iotbiz_package_order",
      biz_id: Number(order.id),
      amount,
      channel_code: opts.channel_code || "mock",
    });
    await this.update({ tenant_id, id: Number(order.id) }, { trade_order_id: Number(tradeOrder.id), payment_order_id: Number(paymentOrder.id) });
    return {
      package_order: await this.findOne({ tenant_id, id: Number(order.id) }),
      trade_order: tradeOrder,
      payment_order: paymentOrder,
    };
  }

  async afterPaid(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.order_id) throw new Error("order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const order = await this.findOne({ tenant_id, id: Number(opts.order_id) });
    if (!order?.id) throw new Error("package order not found");
    if (order.status === "paid") return order;
  
    await this.update({ tenant_id, id: Number(order.id) }, { status: "paid", paid_at: new Date() });
    const entitlement = await think.service("iotbiz.entitlement.grantPackage", {
      tenant_id,
      user_id: Number(order.user_id),
      package_id: Number(order.package_id),
      package_order_id: Number(order.id),
      quantity: Number(order.quantity ?? 1),
    });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.package.paid",
      biz_type: "iotbiz_package_order",
      biz_id: Number(order.id),
      payload_json: JSON.stringify({ entitlement_id: entitlement.id, package_id: order.package_id }),
    });
    return {
      package_order: await this.findOne({ tenant_id, id: Number(order.id) }),
      entitlement,
    };
  }

  async afterRefund(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.order_id) throw new Error("order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const order = await this.findOne({ tenant_id, id: Number(opts.order_id) });
    if (!order?.id) throw new Error("package order not found");
    if (order.status === "refunded") return order;
  
    await think.service("iotbiz.entitlement.revokeGrantedPackage", {
      tenant_id,
      package_order_id: Number(order.id),
    });
    await this.update({ tenant_id, id: Number(order.id) }, { status: "refunded", updated_at: new Date() });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.package.refunded",
      biz_type: "iotbiz_package_order",
      biz_id: Number(order.id),
      payload_json: JSON.stringify({ refund_id: opts.refund_id, package_id: order.package_id }),
    });
    return await this.findOne({ tenant_id, id: Number(order.id) });
  }

}
