import { BaseService, Params } from "thinkts";

export { startSession, getById } from "./session-start.js";
export { cleanupExpiredSessions } from "./session-cleanup.js";


export default class SessionService extends BaseService {
  async afterPaid(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.order_id) throw new Error("order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const session = await this.findOne({ tenant_id, id: Number(opts.order_id) });
    if (!session?.id) throw new Error("device session not found");
    if (["starting", "running", "completed", "refunded"].includes(String(session.status))) {
      return { session, command_log: null, compensated: false };
    }
    const command = await think.service("iotbiz.device.issueStartCommand", {
      tenant_id,
      device_id: Number(session.device_id),
      session_id: Number(session.id),
      payload: { consume_mode: session.consume_mode, trade_order_id: session.trade_order_id, payment_order_id: session.payment_order_id },
    });
    await this.update({ tenant_id, id: Number(session.id) }, {
      status: "starting",
      started_at: new Date(),
      start_payload_json: JSON.stringify(command),
    });
    const next = await this.findOne({ tenant_id, id: Number(session.id) });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.session.paid",
      biz_type: "iotbiz_session",
      biz_id: Number(next.id),
      payload_json: JSON.stringify({ payment_order_id: next.payment_order_id, trade_order_id: next.trade_order_id }),
    });
    return { session: next, command_log: command.command_log };
  }

  @Params({ tenant_id: "int", session_id: "int" })
  async markStarted(opts) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.session_id) throw new Error("session_id is required");
    const tenant_id = Number(opts.tenant_id);
    await this.update({ tenant_id, id: Number(opts.session_id) }, { status: "running", started_at: opts.started_at ?? new Date() });
    return await this.findOne({ tenant_id, id: Number(opts.session_id) });
  }

  @Params({ tenant_id: "int", session_id: "int" })
  async completeSession(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.session_id) throw new Error("session_id is required");
    const tenant_id = Number(opts.tenant_id);
    const session = await this.findOne({ tenant_id, id: Number(opts.session_id) });
    if (!session?.id) throw new Error("device session not found");
    await this.update({ tenant_id, id: Number(session.id) }, { status: "completed", ended_at: new Date(), finish_reason: opts.finish_reason ?? "completed" });
    const next = await this.findOne({ tenant_id, id: Number(session.id) });
    const shares = await think.service("iotbiz.revenue.share.createSessionShares", {
      tenant_id,
      session_id: Number(next.id),
      trade_order_id: Number(next.trade_order_id ?? 0),
      biz_type: "iotbiz_session",
      biz_id: Number(next.id),
      merchant_id: Number(next.merchant_id),
      agent_id: Number(next.agent_id),
      amount: Number(next.payable_amount ?? next.amount ?? 0),
    });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.session.completed",
      biz_type: "iotbiz_session",
      biz_id: Number(next.id),
      payload_json: JSON.stringify({ share_count: shares.length }),
    });
    return { session: next, shares };
  }

  @Params({ tenant_id: "int", session_id: "int" })
  async failSession(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.session_id) throw new Error("session_id is required");
    const tenant_id = Number(opts.tenant_id);
    await this.update({ tenant_id, id: Number(opts.session_id) }, { status: "failed", ended_at: new Date(), finish_reason: opts.finish_reason ?? "failed" });
    const session = await this.findOne({ tenant_id, id: Number(opts.session_id) });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.session.failed",
      biz_type: "iotbiz_session",
      biz_id: Number(session.id),
      payload_json: JSON.stringify({ finish_reason: session.finish_reason }),
    });
    return session;
  }

  @Params({ tenant_id: "int", session_id: "int" })
  async requestRefund(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.session_id) throw new Error("session_id is required");
    const tenant_id = Number(opts.tenant_id);
    const session = await this.findOne({ tenant_id, id: Number(opts.session_id) });
    if (!session?.id) throw new Error("device session not found");
    if (!session.payment_order_id) throw new Error("session has no payment order to refund");
    return await think.service("payment.refund.applyRefund", {
      tenant_id,
      payment_order_id: Number(session.payment_order_id),
      amount: Number(opts.amount ?? session.payable_amount ?? session.amount ?? 0),
      reason: opts.reason ?? "device_aftersale",
    });
  }

  async afterRefund(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    if (!opts?.order_id) throw new Error("order_id is required");
    const tenant_id = Number(opts.tenant_id);
    const session = await this.findOne({ tenant_id, id: Number(opts.order_id) });
    if (!session?.id) throw new Error("device session not found");
  
    if (session.entitlement_id) {
      await think.service("iotbiz.entitlement.restoreConsumedPackage", {
        tenant_id,
        entitlement_id: Number(session.entitlement_id),
        restore_times: Number(session.quantity ?? 0),
        restore_duration_seconds: Number(session.duration_seconds ?? 0),
        restore_amount: 0,
      });
    }
  
    const reversedShares = await think.service("iotbiz.revenue.share.reverseSessionShares", {
      tenant_id,
      session_id: Number(session.id),
      biz_type: "iotbiz_session",
      biz_id: Number(session.id),
    });
  
    await this.update({ tenant_id, id: Number(session.id) }, {
      status: "refunded",
      ended_at: new Date(),
      finish_reason: opts.refund_reason ?? "refunded",
    });
    const next = await this.findOne({ tenant_id, id: Number(session.id) });
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "iotbiz",
      event_code: "iotbiz.session.refunded",
      biz_type: "iotbiz_session",
      biz_id: Number(next.id),
      payload_json: JSON.stringify({ refund_id: opts.refund_id, reversed_share_count: reversedShares.length }),
    });
    return { session: next, reversed_shares: reversedShares };
  }

  @Params({ tenant_id: "int" })
  async getOverview(opts, think) {
    if (!opts?.tenant_id) throw new Error("tenant_id is required");
    const tenant_id = Number(opts.tenant_id);
    const sessions = await this.currentModel().where({ tenant_id }).select();
    const devices = await think.model("iotbiz_device").where({ tenant_id }).select();
    const shareSummary = await think.service("iotbiz.revenue.share.summaryByTenant", { tenant_id });
    const paidSessions = sessions.filter((row) => ["starting", "running", "completed", "refunded"].includes(String(row.status))).length;
    const completedSessions = sessions.filter((row) => String(row.status) === "completed").length;
    const refundedSessions = sessions.filter((row) => String(row.status) === "refunded").length;
    const onlineDevices = devices.filter((row) => String(row.online_status) === "online").length;
    const totalRevenue = sessions.reduce((sum, row) => sum + Number(row.payable_amount ?? row.amount ?? 0), 0);
    return {
      tenant_id,
      devices: {
        total: devices.length,
        online: onlineDevices,
        offline: devices.length - onlineDevices,
      },
      sessions: {
        total: sessions.length,
        paid: paidSessions,
        completed: completedSessions,
        refunded: refundedSessions,
        failed: sessions.filter((row) => String(row.status) === "failed").length,
      },
      finance: {
        total_revenue: Number(totalRevenue.toFixed(2)),
        total_share: Number(shareSummary.total_amount ?? 0),
        pending_share: Number(shareSummary.pending_amount ?? 0),
        settled_share: Number(shareSummary.settled_amount ?? 0),
      },
      recent_sessions: sessions.slice(-10).reverse(),
    };
  }

  async runCleanupSweep(opts, think) {
    return await think.service("index/cron/cleanup", {
      tenant_id: opts?.tenant_id,
      payment_timeout_minutes: Number(opts?.payment_timeout_minutes ?? 30),
      start_timeout_minutes: Number(opts?.start_timeout_minutes ?? 15),
    });
  }

}
