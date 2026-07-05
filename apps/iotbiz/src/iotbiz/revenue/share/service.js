async function createShareRow(service, payload) {
  return await service.create(payload);
}

export async function createSessionShares(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.session_id) throw new Error("session_id is required");
  if (!opts?.trade_order_id) throw new Error("trade_order_id is required");
  if (opts?.amount === undefined) throw new Error("amount is required");
  if (!opts?.merchant_id) throw new Error("merchant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const amount = Number(opts.amount);
  const merchant = await think.service("iotbiz.merchant.getById", { tenant_id, id: Number(opts.merchant_id) });
  const merchantRate = Number(merchant.merchant_share_rate ?? 0.7);
  let agentRate = 0;
  if (opts.agent_id) {
    agentRate = Number(await think.service("promote.commission.rule.getRateForBiz", {
      tenant_id,
      agent_id: Number(opts.agent_id),
      biz_type: "iotbiz_session",
    }));
  }
  const merchantAmount = Number((amount * merchantRate).toFixed(2));
  const agentAmount = Number((amount * agentRate).toFixed(2));
  const platformAmount = Number((amount - merchantAmount - agentAmount).toFixed(2));
  const created = [];
  created.push(await createShareRow(this, {
    tenant_id,
    biz_type: opts.biz_type ?? "iotbiz_session",
    biz_id: Number(opts.biz_id ?? opts.session_id),
    session_id: Number(opts.session_id),
    trade_order_id: Number(opts.trade_order_id),
    receiver_type: "merchant",
    receiver_id: Number(opts.merchant_id),
    rule_type: "merchant_share",
    rate: merchantRate,
    amount: merchantAmount,
    status: "pending",
  }));
  if (opts.agent_id && agentAmount > 0) {
    created.push(await createShareRow(this, {
      tenant_id,
      biz_type: opts.biz_type ?? "iotbiz_session",
      biz_id: Number(opts.biz_id ?? opts.session_id),
      session_id: Number(opts.session_id),
      trade_order_id: Number(opts.trade_order_id),
      receiver_type: "agent",
      receiver_id: Number(opts.agent_id),
      rule_type: "agent_commission",
      rate: agentRate,
      amount: agentAmount,
      status: "pending",
    }));
    await think.service("promote.commission.record.createCommissionRecord", {
      tenant_id,
      agent_id: Number(opts.agent_id),
      amount: agentAmount,
      biz_type: opts.biz_type ?? "iotbiz_session",
      biz_id: Number(opts.biz_id ?? opts.session_id),
      status: "pending",
    });
  }
  created.push(await createShareRow(this, {
    tenant_id,
    biz_type: opts.biz_type ?? "iotbiz_session",
    biz_id: Number(opts.biz_id ?? opts.session_id),
    session_id: Number(opts.session_id),
    trade_order_id: Number(opts.trade_order_id),
    receiver_type: "platform",
    receiver_id: null,
    rule_type: "platform_fee",
    rate: Number((1 - merchantRate - agentRate).toFixed(4)),
    amount: platformAmount,
    status: "pending",
  }));
  return created;
}

export async function summaryByTenant(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const rows = await this.currentModel().where({ tenant_id }).select();
  return {
    total_amount: Number(rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0).toFixed(2)),
    pending_amount: Number(rows.filter((row) => String(row.status) === "pending").reduce((sum, row) => sum + Number(row.amount ?? 0), 0).toFixed(2)),
    settled_amount: Number(rows.filter((row) => String(row.status) === "settled").reduce((sum, row) => sum + Number(row.amount ?? 0), 0).toFixed(2)),
    reversed_amount: Number(rows.filter((row) => String(row.status) === "reversed").reduce((sum, row) => sum + Number(row.amount ?? 0), 0).toFixed(2)),
    count: rows.length,
  };
}
export async function listBySettleOrder(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (opts?.settle_order_id === undefined) throw new Error("settle_order_id is required");
  const tenant_id = Number(opts.tenant_id);
  const settle_order_id = Number(opts.settle_order_id);
  return await this.currentModel().where({ tenant_id, settle_order_id }).select();
}

export async function restoreBySettleOrder(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (opts?.settle_order_id === undefined) throw new Error("settle_order_id is required");
  const tenant_id = Number(opts.tenant_id);
  const settle_order_id = Number(opts.settle_order_id);
  const rows = await this.currentModel().where({ tenant_id, settle_order_id }).select();
  for (const row of rows) {
    await this.update({ tenant_id, id: Number(row.id) }, { settle_order_id: null, status: "pending", updated_at: new Date() });
  }
  return { restored_count: rows.length };
}

export async function listAllByTenant(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  return await this.currentModel().where({ tenant_id }).select();
}

export async function createSettlement(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.receiver_type) throw new Error("receiver_type is required");
  const tenant_id = Number(opts.tenant_id);
  const model = this.currentModel();
  const rows = await model.where({ tenant_id, receiver_type: String(opts.receiver_type), receiver_id: opts.receiver_id == null ? null : Number(opts.receiver_id), status: "pending" }).select();
  if (!rows.length) throw new Error("no pending shares");
  const amount = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const settleOrder = await think.service("trade.settle.order.createSettlementOrder", {
    tenant_id,
    receiver_type: String(opts.receiver_type),
    receiver_id: opts.receiver_id == null ? null : Number(opts.receiver_id),
    amount,
    settle_type: opts.settle_type ?? "shared_device",
  });
  for (const row of rows) {
    await this.update({ tenant_id, id: Number(row.id) }, { settle_order_id: Number(settleOrder.id), status: "settled" });
  }
  return {
    settle_order: settleOrder,
    shares: await model.where({ tenant_id, settle_order_id: Number(settleOrder.id) }).select(),
  };
}
export async function createBatchSettlement(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const receiverType = opts?.receiver_type ? String(opts.receiver_type) : null;
  const overview = await think.service("iotbiz.revenue.share.receiverOverview", { tenant_id, receiver_type: receiverType });
  const pendingRows = overview.rows.filter((row) => Number(row.pending_share ?? 0) > 0);
  if (!pendingRows.length) throw new Error("no pending receivers");
  const settlements = [];
  for (const row of pendingRows) {
    const created = await think.service("iotbiz.revenue.share.createSettlement", {
      tenant_id,
      receiver_type: String(row.receiver_type),
      receiver_id: row.receiver_id == null ? null : Number(row.receiver_id),
      settle_type: opts.settle_type ?? "shared_device",
    }, think);
    settlements.push(created);
  }
  return {
    count: settlements.length,
    total_amount: Number(settlements.reduce((sum, item) => sum + Number(item.settle_order?.amount ?? 0), 0).toFixed(2)),
    settlements,
  };
}

export async function receiverOverview(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const receiverType = opts?.receiver_type ? String(opts.receiver_type) : null;
  const receiverIds = Array.isArray(opts?.receiver_ids)
    ? opts.receiver_ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))
    : String(opts?.receiver_ids ?? "")
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);

  const shares = await this.currentModel().where({ tenant_id }).select();
  const settlements = await this.service("trade.settle.order.listByTenant", { tenant_id });
  const rows = new Map();

  function ensureRow(type, id) {
    const key = `${type}:${id ?? "null"}`;
    if (!rows.has(key)) {
      rows.set(key, {
        receiver_type: type,
        receiver_id: id,
        total_share: 0,
        pending_share: 0,
        settled_share: 0,
        reversed_share: 0,
        settlement_count: 0,
        last_settled_at: null,
      });
    }
    return rows.get(key);
  }

  for (const share of shares) {
    const type = String(share.receiver_type ?? "");
    const id = share.receiver_id == null ? null : Number(share.receiver_id);
    if (receiverType && type !== receiverType) continue;
    if (receiverIds.length && id != null && !receiverIds.includes(id)) continue;
    const row = ensureRow(type, id);
    const amount = Number(share.amount ?? 0);
    row.total_share = Number((row.total_share + amount).toFixed(2));
    const status = String(share.status ?? "pending");
    if (status === "pending") row.pending_share = Number((row.pending_share + amount).toFixed(2));
    else if (status === "settled") row.settled_share = Number((row.settled_share + amount).toFixed(2));
    else row.reversed_share = Number((row.reversed_share + amount).toFixed(2));
  }

  for (const settlement of settlements) {
    const type = String(settlement.receiver_type ?? "");
    const id = settlement.receiver_id == null ? null : Number(settlement.receiver_id);
    if (receiverType && type !== receiverType) continue;
    if (receiverIds.length && id != null && !receiverIds.includes(id)) continue;
    const row = ensureRow(type, id);
    row.settlement_count += 1;
    const settledAt = settlement.settled_at ? String(settlement.settled_at) : null;
    if (!row.last_settled_at || (settledAt && settledAt > row.last_settled_at)) {
      row.last_settled_at = settledAt;
    }
  }

  return {
    rows: Array.from(rows.values()).sort((left, right) => right.pending_share - left.pending_share),
  };
}

export async function reverseSessionShares(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.session_id) throw new Error("session_id is required");
  const tenant_id = Number(opts.tenant_id);
  const model = this.currentModel();
  const rows = await model.where({ tenant_id, session_id: Number(opts.session_id) }).select();
  const reversed = [];
  for (const row of rows) {
    if (String(row.status) === "reversed") continue;
    if (String(row.status) === "settled") {
      const compensation = await this.create({
        tenant_id,
        biz_type: row.biz_type,
        biz_id: Number(row.biz_id),
        session_id: Number(row.session_id),
        trade_order_id: Number(row.trade_order_id),
        receiver_type: String(row.receiver_type),
        receiver_id: row.receiver_id == null ? null : Number(row.receiver_id),
        rule_type: `${String(row.rule_type)}_reverse`,
        rate: Number(row.rate ?? 0),
        amount: -1 * Number(row.amount ?? 0),
        status: "pending",
      });
      reversed.push(compensation);
      continue;
    }
    await this.update({ tenant_id, id: Number(row.id) }, { status: "reversed", updated_at: new Date() });
    reversed.push(await this.findOne({ tenant_id, id: Number(row.id) }));
  }
  await think.service("promote.commission.record.reverseByBiz", {
    tenant_id,
    biz_type: opts.biz_type ?? "iotbiz_session",
    biz_id: Number(opts.biz_id ?? opts.session_id),
  });
  return reversed;
}
