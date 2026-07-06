import { BaseService, Params } from "thinkts";


function buildRefundNo() {
  return `RF${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}


export default class Payment_refundService extends BaseService {
  @Params({ tenant_id: "int", id: "int" })
  async getById(opts) {
    if (!opts?.tenant_id) throw new ValidationError("tenant_id is required", { field: "tenant_id" });
    if (!opts?.id) throw new ValidationError("id is required", { field: "id" });
    const row = await this.findOne({ tenant_id: Number(opts.tenant_id), id: Number(opts.id) });
    if (!row?.id) throw new NotFoundError("refund not found");
    return row;
  }

  @Params({ tenant_id: "int", payment_order_id: "int" })
  async applyRefund(opts, think) {
    if (!opts?.tenant_id) throw new ValidationError("tenant_id is required", { field: "tenant_id" });
    if (!opts?.payment_order_id) throw new ValidationError("payment_order_id is required", { field: "payment_order_id" });
    if (opts?.amount === undefined) throw new ValidationError("amount is required", { field: "amount" });
  
    const tenant_id = Number(opts.tenant_id);
    const paymentOrder = await think.model("payment_order").where({ tenant_id, id: Number(opts.payment_order_id) }).find();
    if (!paymentOrder?.id) throw new NotFoundError("payment order not found");
  
    const refundAmount = Number(opts.amount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw new ValidationError("amount must be greater than 0", { field: "amount" });
    }
  
    const successRefunds = await this.list({ tenant_id, payment_order_id: Number(paymentOrder.id), status: "success" });
    const paymentAmount = Number(paymentOrder.amount ?? 0);
    const refundedAmount = successRefunds.reduce((sum, refund) => sum + Number(refund.amount ?? 0), 0);
    const remainingAmount = Number((paymentAmount - refundedAmount).toFixed(2));
  
    if (remainingAmount <= 0 && successRefunds.length) {
      return successRefunds[successRefunds.length - 1];
    }
    if (refundAmount > remainingAmount) {
      throw new ValidationError(`refund amount exceeds remaining refundable amount ${remainingAmount.toFixed(2)}`, {
        field: "amount",
      });
    }
  
    const refund = await this.create({
      tenant_id,
      refund_no: String(opts.refund_no || buildRefundNo()),
      payment_order_id: Number(paymentOrder.id),
      amount: refundAmount,
      reason: opts.reason || "",
      status: "success",
      third_refund_no: `MOCK_REFUND_${Date.now()}`,
    });
  
    await think.model("payment_order").where({ tenant_id, id: Number(paymentOrder.id) }).update({
      status: "refunded",
      updated_at: new Date(),
    });
  
    await think.service("trade.order.markRefunded", {
      tenant_id,
      order_id: Number(paymentOrder.trade_order_id),
    });
  
    const refundHandlers = {
      iotbiz_session: "iotbiz.session.afterRefund",
      iotbiz_recharge_order: "iotbiz.recharge.order.afterRefund",
      iotbiz_package_order: "iotbiz.package.order.afterRefund",
      mall_order: "mall.order.afterRefund",
    };
    const handler = refundHandlers[String(paymentOrder.biz_type)];
    if (handler) {
      await think.service(handler, {
        tenant_id,
        order_id: Number(paymentOrder.biz_id),
        refund_id: Number(refund.id),
        refund_amount: Number(refund.amount),
        refund_reason: refund.reason,
      });
    }
  
    await think.service("event.record.publish", {
      tenant_id,
      module_code: "payment",
      event_code: "payment.refund.success",
      biz_type: String(paymentOrder.biz_type),
      biz_id: Number(paymentOrder.biz_id),
      payload_json: JSON.stringify({ refund_id: refund.id, payment_order_id: paymentOrder.id, amount: refund.amount }),
    });
  
    return await this.findOne({ tenant_id, id: Number(refund.id) });
  }

}
