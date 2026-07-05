function buildMerchantNo() {
  return `M${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const merchant = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
  if (!merchant?.id) throw new Error("merchant not found");
  return merchant;
}

export async function registerMerchant(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.name) throw new Error("name is required");
  if (!opts?.agent_id) throw new Error("agent_id is required");

  const tenant_id = Number(opts.tenant_id);
  await think.service("promote.agent.getById", { tenant_id, id: Number(opts.agent_id) });

  const merchant_no = String(opts.merchant_no || buildMerchantNo());
  const existing = await this.findOne({ tenant_id, merchant_no });
  if (existing?.id) throw new Error("merchant_no exists");

  return await this.create({
    tenant_id,
    merchant_no,
    name: String(opts.name),
    agent_id: Number(opts.agent_id),
    contact_user_id: opts.contact_user_id ? Number(opts.contact_user_id) : null,
    contact_name: opts.contact_name ?? null,
    contact_phone: opts.contact_phone ?? null,
    merchant_share_rate: opts.merchant_share_rate ?? 0.7,
    settlement_cycle: opts.settlement_cycle ?? "weekly",
    signed_at: opts.signed_at ?? new Date(),
    status: opts.status ?? "enabled",
    extra_json: opts.extra_json ?? null,
  });
}

export async function workbench(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const merchants = await this.list({ tenant_id });
  const deviceOverview = await think.service("iotbiz.device.relationOverview", {
    tenant_id,
    relation_type: "merchant",
  });
  const shareOverview = await think.service("iotbiz.revenue.share.receiverOverview", {
    tenant_id,
    receiver_type: "merchant",
  });
  const deviceRows = new Map((deviceOverview.rows ?? []).map((row) => [Number(row.relation_id), row]));
  const shareRows = new Map((shareOverview.rows ?? []).map((row) => [Number(row.receiver_id), row]));

  const rows = merchants.map((merchant) => {
    const deviceRow = deviceRows.get(Number(merchant.id));
    const shareRow = shareRows.get(Number(merchant.id));
    return {
      id: Number(merchant.id),
      merchant_no: merchant.merchant_no,
      name: merchant.name,
      agent_id: Number(merchant.agent_id),
      status: merchant.status,
      settlement_cycle: merchant.settlement_cycle,
      total_devices: Number(deviceRow?.total_devices ?? 0),
      online_devices: Number(deviceRow?.online_devices ?? 0),
      total_sessions: Number(deviceRow?.total_sessions ?? 0),
      completed_sessions: Number(deviceRow?.completed_sessions ?? 0),
      refunded_sessions: Number(deviceRow?.refunded_sessions ?? 0),
      total_revenue: Number(deviceRow?.total_revenue ?? 0),
      pending_share: Number(shareRow?.pending_share ?? 0),
      settled_share: Number(shareRow?.settled_share ?? 0),
      last_settled_at: shareRow?.last_settled_at ?? null,
    };
  }).sort((left, right) => right.total_revenue - left.total_revenue);

  return {
    total_merchants: rows.length,
    enabled_merchants: rows.filter((row) => String(row.status) === "enabled").length,
    pending_settlement_merchants: rows.filter((row) => Number(row.pending_share) > 0).length,
    rows,
  };
}
