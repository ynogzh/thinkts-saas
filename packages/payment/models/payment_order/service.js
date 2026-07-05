import { NotFoundError } from "thinkts";

export async function createPay(opts, think) {
  if (!opts.tenant_id) throw new Error("tenant_id is required");
  if (!opts.trade_order_id) throw new Error("trade_order_id is required");
  if (!opts.biz_type) throw new Error("biz_type is required");
  if (!opts.biz_id) throw new Error("biz_id is required");
  if (opts.amount === undefined) throw new Error("amount is required");

  const tenantId = Number(opts.tenant_id);
  const tradeOrder = await think.service("trade.order.getPayableOrder", {
    tenant_id: tenantId,
    order_id: Number(opts.trade_order_id),
  });

  const pay_no = "P" + Date.now() + Math.floor(1000 + Math.random() * 9000);
  const channelCode = opts.channel_code || "mock";

  return await this.create({
    tenant_id: tenantId,
    pay_no,
    trade_order_id: tradeOrder.id,
    biz_type: opts.biz_type,
    biz_id: opts.biz_id,
    amount: Number(opts.amount),
    channel_code: channelCode,
    status: "created",
  });
}

export async function getByPayNo(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.pay_no) throw new Error("pay_no is required");
  const order = await this.findOne({ tenant_id: Number(opts.tenant_id), pay_no: String(opts.pay_no) });
  if (!order?.id) throw new NotFoundError("payment order not found");
  return order;
}

function paidBizHandler(bizType) {
  return {
    mall_order: "mall.order.afterPaid",
    iotbiz_recharge_order: "iotbiz.recharge.order.afterPaid",
    iotbiz_package_order: "iotbiz.package.order.afterPaid",
    iotbiz_session: "iotbiz.session.afterPaid",
  }[String(bizType)];
}

async function dispatchPaidBusiness(order, tenantId, think) {
  await think.service("trade.order.markPaid", {
    tenant_id: tenantId,
    order_id: order.trade_order_id,
  });

  const handler = paidBizHandler(order.biz_type);
  const business_result = handler ? await think.service(handler, {
    tenant_id: tenantId,
    order_id: order.biz_id,
  }) : null;

  return { handler, business_result };
}

export async function mockPay(opts, think) {
  if (!opts.tenant_id) throw new Error("tenant_id is required");
  if (!opts.pay_no) throw new Error("pay_no is required");

  const tenantId = Number(opts.tenant_id);
  const order = await think.service("payment.order.getByPayNo", {
    tenant_id: tenantId,
    pay_no: String(opts.pay_no),
  });

  const idempotentKey = `mock_pay_${opts.pay_no}`;
  const callbackModel = this.model("payment_callback_log");
  const existing = await callbackModel.where({ tenant_id: tenantId, idempotent_key: idempotentKey }).find();
  if (existing?.id) {
    return await this.findOne({ id: order.id, tenant_id: tenantId });
  }

  await callbackModel.create({
    tenant_id: tenantId,
    channel_code: order.channel_code,
    pay_no: order.pay_no,
    callback_type: "pay",
    request_body: JSON.stringify({ pay_no: opts.pay_no, status: "success" }),
    verify_status: "success",
    handle_status: "success",
    idempotent_key: idempotentKey,
  });

  await this.update({ id: order.id, tenant_id: tenantId }, {
    status: "success",
    third_trade_no: "MOCK_" + Date.now(),
    paid_at: new Date(),
  });

  await dispatchPaidBusiness(order, tenantId, think);

  await think.service("event.record.publish", {
    tenant_id: tenantId,
    module_code: "payment",
    event_code: "payment.success",
    biz_type: order.biz_type,
    biz_id: order.biz_id,
    payload_json: JSON.stringify({ pay_no: order.pay_no }),
  });

  return await this.findOne({ id: order.id, tenant_id: tenantId });
}

export async function compensatePaid(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.payment_order_id && !opts?.pay_no) throw new Error("payment_order_id or pay_no is required");

  const tenantId = Number(opts.tenant_id);
  const order = opts.payment_order_id
    ? await this.findOne({ tenant_id: tenantId, id: Number(opts.payment_order_id) })
    : await think.service("payment.order.getByPayNo", { tenant_id: tenantId, pay_no: String(opts.pay_no) });
  if (!order?.id) throw new NotFoundError("payment order not found");
  if (String(order.status) !== "success") throw new Error(`payment order is not successful: ${String(order.status)}`);

  const result = await dispatchPaidBusiness(order, tenantId, think);
  await think.service("event.record.publish", {
    tenant_id: tenantId,
    module_code: "payment",
    event_code: "payment.success.compensated",
    biz_type: order.biz_type,
    biz_id: order.biz_id,
    payload_json: JSON.stringify({ pay_no: order.pay_no, reason: opts.reason ?? "manual_compensation" }),
  });

  return {
    payment_order: await this.findOne({ tenant_id: tenantId, id: Number(order.id) }),
    ...result,
  };
}

export async function createRefund(opts) {
  if (!opts.tenant_id) throw new Error("tenant_id is required");
  if (!opts.payment_order_id) throw new Error("payment_order_id is required");
  if (opts.amount === undefined) throw new Error("amount is required");

  const tenantId = Number(opts.tenant_id);
  const payOrder = await this.findOne({ id: Number(opts.payment_order_id), tenant_id: tenantId });
  if (!payOrder?.id) throw new NotFoundError("payment order not found");

  const refund_no = "R" + Date.now() + Math.floor(1000 + Math.random() * 9000);
  return await this.model("payment_refund").create({
    tenant_id: tenantId,
    refund_no,
    payment_order_id: payOrder.id,
    amount: Number(opts.amount),
    reason: opts.reason || "",
    status: "created",
  });
}
