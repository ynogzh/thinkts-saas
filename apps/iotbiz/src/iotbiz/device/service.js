function buildDeviceNo() {
  return `D${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function getById(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.id) throw new Error("id is required");
  const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
  if (!row?.id) throw new Error("device not found");
  return row;
}

export async function applyParamTemplate(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  if (!opts?.template) throw new Error("template is required");
  const tenant_id = Number(opts.tenant_id);
  const id = Number(opts.device_id);
  await getById.call(this, { tenant_id, id });
  const template = opts.template;
  await this.update({ tenant_id, id }, {
    start_mode: template.start_mode,
    pricing_json: template.pricing_json,
    start_config_json: template.start_config_json,
    metadata_json: template.metadata_json,
  });
  return await getById.call(this, { tenant_id, id });
}

export async function registerDevice(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.merchant_id) throw new Error("merchant_id is required");
  if (!opts?.type_id) throw new Error("type_id is required");
  if (!opts?.name) throw new Error("name is required");

  const tenant_id = Number(opts.tenant_id);
  const merchant = await think.service("iotbiz.merchant.getById", { tenant_id, id: Number(opts.merchant_id) });
  const type = await think.service("iotbiz.device.type.getById", { tenant_id, id: Number(opts.type_id) });
  const device_no = String(opts.device_no || buildDeviceNo());
  const existing = await this.findOne({ tenant_id, device_no });
  if (existing?.id) throw new Error("device_no exists");

  return await this.create({
    tenant_id,
    device_no,
    name: String(opts.name),
    merchant_id: Number(merchant.id),
    agent_id: Number(merchant.agent_id),
    type_id: Number(type.id),
    location_label: opts.location_label ?? null,
    online_status: opts.online_status ?? "offline",
    start_mode: opts.start_mode ?? type.start_mode ?? "mock",
    pricing_json: opts.pricing_json ?? JSON.stringify({ mode: type.billing_mode, unit_price: type.default_unit_price ?? 0 }),
    start_config_json: opts.start_config_json ?? null,
    status: opts.status ?? "enabled",
    metadata_json: opts.metadata_json ?? null,
  });
}

export async function heartbeat(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  await this.update({ tenant_id: Number(opts.tenant_id), id: Number(opts.device_id) }, {
    online_status: opts.online_status ?? "online",
    last_heartbeat_at: new Date(),
  });
  return await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.device_id) });
}
export async function restoreDeviceOnline(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  const tenant_id = Number(opts.tenant_id);
  const device_id = Number(opts.device_id);
  const device = await this.findOne({ tenant_id, id: device_id });
  if (!device?.id) throw new Error("device not found");
  await this.update({ tenant_id, id: device_id }, {
    online_status: opts.online_status ?? "online",
    status: opts.status ?? device.status ?? "enabled",
    last_heartbeat_at: new Date(),
    updated_at: new Date(),
  });
  const restored = await this.findOne({ tenant_id, id: device_id });
  await think.service("event.record.publish", {
    tenant_id,
    module_code: "iotbiz",
    event_code: "iotbiz.device.restored",
    biz_type: "iotbiz_device",
    biz_id: device_id,
    payload_json: JSON.stringify({
      reason: opts.reason ?? "manual_restore",
      operator_user_id: opts.operator_user_id ?? null,
    }),
  });
  return restored;
}

export async function resolveDeviceAlert(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const result = {
    device: null,
    event: null,
    deliveries: [],
  };
  if (opts?.device_id) {
    result.device = await think.service("iotbiz.device.restoreDeviceOnline", {
      tenant_id,
      device_id: Number(opts.device_id),
      reason: opts.reason ?? "alert_resolved",
      operator_user_id: opts.operator_user_id ?? null,
      online_status: opts.online_status,
      status: opts.status,
    }, think);
  }
  if (opts?.event_id) {
    const consumed = await think.service("event.record.consume", {
      tenant_id,
      id: Number(opts.event_id),
    });
    result.event = consumed.event;
    result.deliveries = consumed.deliveries ?? [];
  }
  return result;
}
export async function runHeartbeatSweep(opts, think) {
  return await think.service("index/cron/heartbeat", {
    tenant_id: opts?.tenant_id,
    stale_after_minutes: Number(opts?.stale_after_minutes ?? 10),
  });
}

export async function markStaleOffline(opts, think) {
  const staleAfterMinutes = Math.max(Number(opts?.stale_after_minutes ?? 10), 1);
  const tenant_id = opts?.tenant_id ? Number(opts.tenant_id) : null;
  const cutoff = new Date(Date.now() - staleAfterMinutes * 60 * 1000);
  const rows = await this.list(tenant_id ? { tenant_id } : {});
  const staleDevices = rows.filter((row) => {
    if (String(row.online_status ?? "offline") !== "online") return false;
    if (!row.last_heartbeat_at) return true;
    return new Date(String(row.last_heartbeat_at)).getTime() < cutoff.getTime();
  });

  for (const device of staleDevices) {
    await this.update({ tenant_id: Number(device.tenant_id), id: Number(device.id) }, {
      online_status: "offline",
      updated_at: new Date(),
    });
    await think.service("event.record.publish", {
      tenant_id: Number(device.tenant_id),
      module_code: "iotbiz",
      event_code: "iotbiz.device.offline.detected",
      biz_type: "iotbiz_device",
      biz_id: Number(device.id),
      payload_json: JSON.stringify({
        cutoff_at: cutoff.toISOString(),
        last_heartbeat_at: device.last_heartbeat_at ?? null,
      }),
    });
  }

  return {
    scanned: rows.length,
    offline: staleDevices.length,
    cutoff_at: cutoff.toISOString(),
  };
}

export async function issueStartCommand(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.device_id) throw new Error("device_id is required");
  const tenant_id = Number(opts.tenant_id);
  const device = await think.service("iotbiz.device.getById", { tenant_id, id: Number(opts.device_id) });
  const commandLog = await think.service("iotbiz.command.log.createCommandLog", {
    tenant_id,
    device_id: Number(device.id),
    session_id: opts.session_id ? Number(opts.session_id) : null,
    command_type: "start_session",
    request_payload_json: JSON.stringify({ device_id: device.id, start_mode: device.start_mode, payload: opts.payload ?? {} }),
    response_payload_json: JSON.stringify({ accepted: true, simulated: true }),
    status: "sent",
  });
  await this.update({ tenant_id, id: Number(device.id) }, { last_start_at: new Date(), online_status: "online" });
  return { device, command_log: commandLog };
}

export async function relationOverview(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  const tenant_id = Number(opts.tenant_id);
  const relationType = String(opts.relation_type ?? "merchant");
  const relationField = relationType === "agent" ? "agent_id" : "merchant_id";
  const relationIds = Array.isArray(opts?.relation_ids)
    ? opts.relation_ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))
    : String(opts?.relation_ids ?? "")
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isFinite(value) && value > 0);

  const devices = await this.currentModel().where({ tenant_id }).select();
  const filteredDevices = relationIds.length
    ? devices.filter((device) => relationIds.includes(Number(device[relationField] ?? 0)))
    : devices;
  const sessions = await this.model("iotbiz_session").where({ tenant_id }).select();
  const deviceMap = new Map(filteredDevices.map((device) => [Number(device.id), device]));
  const rows = new Map();

  function ensureRow(relationId) {
    if (!rows.has(relationId)) {
      rows.set(relationId, {
        relation_id: relationId,
        total_devices: 0,
        online_devices: 0,
        offline_devices: 0,
        maintenance_devices: 0,
        total_sessions: 0,
        completed_sessions: 0,
        refunded_sessions: 0,
        failed_sessions: 0,
        running_sessions: 0,
        pending_sessions: 0,
        total_revenue: 0,
      });
    }
    return rows.get(relationId);
  }

  for (const device of filteredDevices) {
    const relationId = Number(device[relationField] ?? 0);
    if (!relationId) continue;
    const row = ensureRow(relationId);
    row.total_devices += 1;
    const status = String(device.online_status ?? "offline");
    if (status === "online") row.online_devices += 1;
    else if (status === "maintenance") row.maintenance_devices += 1;
    else row.offline_devices += 1;
  }

  for (const session of sessions) {
    const device = deviceMap.get(Number(session.device_id ?? 0));
    if (!device) continue;
    const relationId = Number(device[relationField] ?? 0);
    if (!relationId) continue;
    const row = ensureRow(relationId);
    row.total_sessions += 1;
    const status = String(session.status ?? "");
    if (status === "completed") {
      row.completed_sessions += 1;
      row.total_revenue = Number((row.total_revenue + Number(session.payable_amount ?? session.amount ?? 0)).toFixed(2));
    } else if (status === "refunded") row.refunded_sessions += 1;
    else if (status === "failed") row.failed_sessions += 1;
    else if (status === "running" || status === "starting") row.running_sessions += 1;
    else row.pending_sessions += 1;
  }

  return {
    relation_type: relationType,
    rows: Array.from(rows.values()).sort((left, right) => right.total_revenue - left.total_revenue),
  };
}
