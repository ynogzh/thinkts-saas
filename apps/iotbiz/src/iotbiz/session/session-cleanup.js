export async function cleanupExpiredSessions(opts, think) {
  const tenant_id = opts?.tenant_id ? Number(opts.tenant_id) : null;
  const paymentTimeoutMinutes = Math.max(Number(opts?.payment_timeout_minutes ?? 30), 1);
  const startTimeoutMinutes = Math.max(Number(opts?.start_timeout_minutes ?? 15), 1);
  const paymentCutoff = new Date(Date.now() - paymentTimeoutMinutes * 60 * 1000);
  const startCutoff = new Date(Date.now() - startTimeoutMinutes * 60 * 1000);
  const sessions = await this.list(tenant_id ? { tenant_id } : {});
  const affected = [];

  for (const session of sessions) {
    const status = String(session.status ?? "");
    if (status === "awaiting_payment") {
      const createdAt = session.created_at ? new Date(String(session.created_at)) : null;
      if (!createdAt || createdAt.getTime() >= paymentCutoff.getTime()) continue;
      await this.update({ tenant_id: Number(session.tenant_id), id: Number(session.id) }, {
        status: "failed",
        ended_at: new Date(),
        finish_reason: "payment_timeout",
      });
      await think.service("event.record.publish", {
        tenant_id: Number(session.tenant_id),
        module_code: "iotbiz",
        event_code: "iotbiz.session.payment_timeout",
        biz_type: "iotbiz_session",
        biz_id: Number(session.id),
        payload_json: JSON.stringify({ payment_order_id: session.payment_order_id ?? null }),
      });
      affected.push({ id: Number(session.id), action: "payment_timeout" });
      continue;
    }

    if (status !== "starting") continue;
    const startedAt = session.started_at ? new Date(String(session.started_at)) : session.created_at ? new Date(String(session.created_at)) : null;
    if (!startedAt || startedAt.getTime() >= startCutoff.getTime()) continue;

    if (session.payment_order_id) {
      await think.service("payment.refund.applyRefund", {
        tenant_id: Number(session.tenant_id),
        payment_order_id: Number(session.payment_order_id),
        amount: Number(session.payable_amount ?? session.amount ?? 0),
        reason: "device_start_timeout",
      });
      affected.push({ id: Number(session.id), action: "refunded" });
      continue;
    }

    if (session.entitlement_id) {
      await think.service("iotbiz.entitlement.restoreConsumedPackage", {
        tenant_id: Number(session.tenant_id),
        entitlement_id: Number(session.entitlement_id),
        restore_times: Number(session.quantity ?? 0),
        restore_duration_seconds: Number(session.duration_seconds ?? 0),
        restore_amount: 0,
      });
    }

    await this.update({ tenant_id: Number(session.tenant_id), id: Number(session.id) }, {
      status: "failed",
      ended_at: new Date(),
      finish_reason: "start_timeout",
    });
    await think.service("event.record.publish", {
      tenant_id: Number(session.tenant_id),
      module_code: "iotbiz",
      event_code: "iotbiz.session.start_timeout",
      biz_type: "iotbiz_session",
      biz_id: Number(session.id),
      payload_json: JSON.stringify({ entitlement_id: session.entitlement_id ?? null }),
    });
    affected.push({ id: Number(session.id), action: "start_timeout" });
  }

  return {
    scanned: sessions.length,
    affected,
  };
}
