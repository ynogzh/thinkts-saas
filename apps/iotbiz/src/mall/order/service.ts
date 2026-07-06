import { BaseService } from "thinkts";



export default class OrderService extends BaseService {
  async submitOrder(opts, think) {
    if (!opts.tenant_id) throw new Error("tenant_id is required");
    if (!opts.user_id) throw new Error("user_id is required");
    if (!opts.product_id) throw new Error("product_id is required");
    if (opts.quantity === undefined || opts.quantity === null) throw new Error("quantity is required");
  
    const tenantId = Number(opts.tenant_id);
    const product = await think.model("mall_product").where({ id: opts.product_id, tenant_id: tenantId }).find();
    if (!product?.id) throw new NotFoundError("product not found");
  
    const quantity = Number(opts.quantity);
    const amount = Number(product.price) * quantity;
    const order_no = "M" + Date.now() + Math.floor(1000 + Math.random() * 9000);
  
    const order = await think.model("mall_order").create({
      tenant_id: tenantId,
      order_no,
      user_id: opts.user_id,
      amount,
      status: "created",
      agent_id: opts.agent_id || null,
      channel_id: opts.channel_id || null,
    });
  
    const item = await think.model("mall_order_item").create({
      tenant_id: tenantId,
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: Number(product.price),
      amount,
    });
  
    const tradeOrder = await think.service("trade.order.createOrder", {
      tenant_id: tenantId,
      biz_type: "mall_order",
      biz_id: order.id,
      user_id: opts.user_id,
      amount,
      pay_amount: amount,
    });
  
    const paymentOrder = await think.service("payment.order.createPay", {
      tenant_id: tenantId,
      trade_order_id: tradeOrder.id,
      biz_type: "mall_order",
      biz_id: order.id,
      amount: order.pay_amount ?? order.amount,
      channel_code: opts.channel_code || "mock",
    });
  
    return {
      mall_order: order,
      item,
      trade_order: tradeOrder,
      payment_order: paymentOrder,
    };
  }

  async afterPaid(opts, think) {
    if (!opts.tenant_id) throw new Error("tenant_id is required");
    if (!opts.order_id) throw new Error("order_id is required");
  
    const tenantId = Number(opts.tenant_id);
    const order = await think.model("mall_order").where({ id: opts.order_id, tenant_id: tenantId }).find();
    if (!order?.id) throw new NotFoundError("mall order not found");
  
    await think.model("mall_order").where({ id: order.id, tenant_id: tenantId }).update({
      status: "paid",
    });
  
    return think.model("mall_order").where({ id: order.id, tenant_id: tenantId }).find();
  }

  async afterRefund(opts, think) {
    if (!opts.tenant_id) throw new Error("tenant_id is required");
    if (!opts.order_id) throw new Error("order_id is required");
  
    const tenantId = Number(opts.tenant_id);
    const order = await think.model("mall_order").where({ id: opts.order_id, tenant_id: tenantId }).find();
    if (!order?.id) throw new NotFoundError("mall order not found");
  
    await think.model("mall_order").where({ id: order.id, tenant_id: tenantId }).update({
      status: "refunded",
      updated_at: new Date(),
    });
  
    return think.model("mall_order").where({ id: order.id, tenant_id: tenantId }).find();
  }

}
