function buildSessionNo() {
  return `S${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

function parsePricing(device) {
  if (!device?.pricing_json) return {};
  if (typeof device.pricing_json !== "string") return device.pricing_json;
  try {
    return JSON.parse(device.pricing_json);
  } catch {
    return {};
  }
}

export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
  if (!row?.id) throw new Error("device session not found");
  return row;
}

export async function startSession(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  if (!opts?.consume_mode) throw new Error("consume_mode is required");
  const tenant_id = Number(opts.tenant_id);
  const device = await think.service("iotbiz.device.getById", { tenant_id, id: Number(opts.device_id) });
  const pricing = parsePricing(device);
  const unit_price = Number(opts.unit_price ?? pricing.unit_price ?? 0);
  const quantity = Number(opts.quantity ?? 1);
  const duration_seconds = opts.duration_seconds == null ? null : Number(opts.duration_seconds);
  const payable_amount = Number((unit_price * quantity).toFixed(2));
  const session = await this.create({
    tenant_id,
    session_no: String(opts.session_no || buildSessionNo()),
    device_id: Number(device.id),
    merchant_id: Number(device.merchant_id),
    agent_id: Number(device.agent_id),
    user_id: Number(opts.user_id),
    consume_mode: String(opts.consume_mode),
    package_id: opts.package_id ? Number(opts.package_id) : null,
    unit_price,
    quantity,
    duration_seconds,
    amount: payable_amount,
    payable_amount,
    status: opts.consume_mode === "package" ? "starting" : "awaiting_payment",
  });

  if (String(opts.consume_mode) === "package") {
    if (!opts.package_id) throw new Error("package_id is required");
    const entitlement = await think.service("iotbiz.entitlement.consumePackage", {
      tenant_id,
      user_id: Number(opts.user_id),
      package_id: Number(opts.package_id),
      consume_times: quantity,
      consume_duration_seconds: duration_seconds ?? 0,
      consume_amount: 0,
    });
    const command = await think.service("iotbiz.device.issueStartCommand", {
      tenant_id,
      device_id: Number(device.id),
      session_id: Number(session.id),
      payload: { consume_mode: "package", package_id: Number(opts.package_id) },
    });
    await this.update({ tenant_id, id: Number(session.id) }, {
      entitlement_id: Number(entitlement.id),
      status: "starting",
      started_at: new Date(),
      start_payload_json: JSON.stringify(command),
    });
    const next = await this.findOne({ tenant_id, id: Number(session.id) });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.session.start_requested",
      biz_type: "iotbiz_session",
      biz_id: Number(next.id),
      payload_json: JSON.stringify({ consume_mode: "package", entitlement_id: entitlement.id }),
    });
    return { session: next, entitlement, command_log: command.command_log };
  }

  const tradeOrder = await think.service("trade.order.createOrder", {
    tenant_id,
    biz_type: "iotbiz_session",
    biz_id: Number(session.id),
    user_id: Number(opts.user_id),
    amount: payable_amount,
    pay_amount: payable_amount,
  });
  const paymentOrder = await think.service("payment.order.createPay", {
    tenant_id,
    trade_order_id: Number(tradeOrder.id),
    biz_type: "iotbiz_session",
    biz_id: Number(session.id),
    amount: payable_amount,
    channel_code: opts.channel_code || "mock",
  });
  await this.update({ tenant_id, id: Number(session.id) }, {
    trade_order_id: Number(tradeOrder.id),
    payment_order_id: Number(paymentOrder.id),
    status: "awaiting_payment",
  });
  return {
    session: await this.findOne({ tenant_id, id: Number(session.id) }),
    trade_order: tradeOrder,
    payment_order: paymentOrder,
  };
}
