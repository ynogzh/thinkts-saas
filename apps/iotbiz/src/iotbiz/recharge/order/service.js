function buildRechargeNo() {
  return `R${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
  if (!row?.id) throw new Error("recharge order not found");
  return row;
}

export async function createOrder(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");
  if (opts?.amount === undefined) throw new Error("amount is required");
  const tenant_id = Number(opts.tenant_id);
  const order = await this.create({
    tenant_id,
    user_id: Number(opts.user_id),
    recharge_no: String(opts.recharge_no || buildRechargeNo()),
    asset_type: String(opts.asset_type || "member_wallet"),
    amount: Number(opts.amount),
    bonus_amount: Number(opts.bonus_amount ?? 0),
    status: "created",
  });
  const tradeOrder = await think.service("trade.order.createOrder", {
    tenant_id,
    biz_type: "iotbiz_recharge_order",
    biz_id: Number(order.id),
    user_id: Number(opts.user_id),
    amount: Number(opts.amount),
    pay_amount: Number(opts.amount),
  });
  const paymentOrder = await think.service("payment.order.createPay", {
    tenant_id,
    trade_order_id: Number(tradeOrder.id),
    biz_type: "iotbiz_recharge_order",
    biz_id: Number(order.id),
    amount: Number(opts.amount),
    channel_code: opts.channel_code || "mock",
  });
  await this.update({ tenant_id, id: Number(order.id) }, { trade_order_id: Number(tradeOrder.id), payment_order_id: Number(paymentOrder.id) });
  return {
    recharge_order: await this.findOne({ tenant_id, id: Number(order.id) }),
    trade_order: tradeOrder,
    payment_order: paymentOrder,
  };
}

export async function afterPaid(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.order_id) throw new Error("order_id is required");
  const tenant_id = Number(opts.tenant_id);
  const order = await this.findOne({ tenant_id, id: Number(opts.order_id) });
  if (!order?.id) throw new Error("recharge order not found");
  if (order.status === "paid") return order;

  await think.service("account.asset.changeBalance", {
    tenant_id,
    user_id: Number(order.user_id),
    asset_type: String(order.asset_type),
    change_amount: Number(order.amount) + Number(order.bonus_amount ?? 0),
    biz_type: "iotbiz_recharge_order",
    biz_id: Number(order.id),
    change_type: "recharge",
  });
  await this.update({ tenant_id, id: Number(order.id) }, { status: "paid", paid_at: new Date() });
  await think.service("event.record.publish", {
    tenant_id,
    module_code: "iotbiz",
    event_code: "iotbiz.recharge.paid",
    biz_type: "iotbiz_recharge_order",
    biz_id: Number(order.id),
    payload_json: JSON.stringify({ amount: order.amount, bonus_amount: order.bonus_amount ?? 0 }),
  });
  return await this.findOne({ tenant_id, id: Number(order.id) });
}

export async function afterRefund(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.order_id) throw new Error("order_id is required");
  const tenant_id = Number(opts.tenant_id);
  const order = await this.findOne({ tenant_id, id: Number(opts.order_id) });
  if (!order?.id) throw new Error("recharge order not found");
  if (order.status === "refunded") return order;

  await think.service("account.asset.changeBalance", {
    tenant_id,
    user_id: Number(order.user_id),
    asset_type: String(order.asset_type),
    change_amount: -1 * (Number(order.amount) + Number(order.bonus_amount ?? 0)),
    biz_type: "member_recharge_refund",
    biz_id: Number(opts.refund_id ?? order.id),
    change_type: "refund",
  });
  await this.update({ tenant_id, id: Number(order.id) }, { status: "refunded", updated_at: new Date() });
  await think.service("event.record.publish", {
    tenant_id,
    module_code: "iotbiz",
    event_code: "iotbiz.recharge.refunded",
    biz_type: "iotbiz_recharge_order",
    biz_id: Number(order.id),
    payload_json: JSON.stringify({ refund_id: opts.refund_id, amount: opts.refund_amount ?? order.amount }),
  });
  return await this.findOne({ tenant_id, id: Number(order.id) });
}
