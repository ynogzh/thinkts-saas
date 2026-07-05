function now() {
  return new Date();
}

function buildCouponNo() {
  return `CP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

function addDays(date, days) {
  return new Date(date.getTime() + Number(days) * 24 * 60 * 60 * 1000);
}

function resolveValidWindow(template) {
  const current = now();
  const activeFrom = new Date(current.getTime() - 1000);
  if (template.valid_type === "fixed") {
    return {
      valid_start_at: template.valid_start_at ?? activeFrom,
      valid_end_at: template.valid_end_at,
    };
  }
  const days = Number(template.valid_days ?? 30);
  return { valid_start_at: activeFrom, valid_end_at: addDays(current, days) };
}

function assertUsable(coupon, template, amount) {
  if (!coupon?.id) throw new Error("coupon not found");
  if (coupon.status !== "unused") throw new Error("coupon is not unused");
  if (template.status !== "enabled") throw new Error("coupon template is disabled");
  const current = Date.now();
  if (new Date(coupon.valid_start_at).getTime() > current) throw new Error("coupon is not active");
  if (new Date(coupon.valid_end_at).getTime() < current) throw new Error("coupon is expired");
  const threshold = Number(template.threshold_amount ?? 0);
  if (Number(amount) < threshold) throw new Error("amount does not meet coupon threshold");
}

function calculateDiscountAmount(template, amount) {
  const original = Number(amount);
  const type = String(template.coupon_type ?? "cash");
  if (type === "discount" || type === "percent") {
    const rate = Number(template.discount_rate ?? 1);
    return Number(Math.min(original, Math.max(0, original * (1 - rate))).toFixed(2));
  }
  return Number(Math.min(original, Number(template.face_value ?? 0)).toFixed(2));
}

export async function issueFromTemplate(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.template_id) throw new Error("template_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");
  const tenant_id = Number(opts.tenant_id);
  const template_id = Number(opts.template_id);
  const user_id = Number(opts.user_id);
  const template = await think.service("promote.coupon.template.getById", { tenant_id, id: template_id });
  if (template.status !== "enabled") throw new Error("coupon template is disabled");
  const remaining = template.remaining_quantity == null ? null : Number(template.remaining_quantity);
  if (remaining !== null && remaining <= 0) throw new Error("coupon template has no remaining quantity");
  const limit = template.per_user_limit == null ? null : Number(template.per_user_limit);
  if (limit !== null) {
    const existing = await this.list({ tenant_id, user_id, template_id });
    if (existing.length >= limit) throw new Error("coupon per-user limit exceeded");
  }
  const window = resolveValidWindow(template);
  if (!window.valid_end_at) throw new Error("coupon valid_end_at is required");
  const coupon = await this.create({
    tenant_id,
    user_id,
    template_id,
    coupon_no: buildCouponNo(),
    status: "unused",
    received_at: now(),
    valid_start_at: window.valid_start_at,
    valid_end_at: window.valid_end_at,
  });
  if (remaining !== null) {
    await think.service("promote.coupon.template.decrementRemaining", { tenant_id, id: template_id });
  }
  return coupon;
}

export async function available(opts) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_id) throw new Error("user_id is required");
  const rows = await this.list({ tenant_id: Number(opts.tenant_id), user_id: Number(opts.user_id), status: "unused" });
  const current = Date.now();
  return rows.filter((row) => new Date(row.valid_start_at).getTime() <= current && new Date(row.valid_end_at).getTime() >= current);
}

export async function calculateDiscount(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_coupon_id) throw new Error("user_coupon_id is required");
  if (opts?.amount === undefined) throw new Error("amount is required");
  const tenant_id = Number(opts.tenant_id);
  const coupon = await this.findOne({ tenant_id, id: Number(opts.user_coupon_id) });
  if (!coupon?.id) throw new Error("coupon not found");
  const template = await think.service("promote.coupon.template.getById", { tenant_id, id: Number(coupon.template_id) });
  assertUsable(coupon, template, Number(opts.amount));
  const discount_amount = calculateDiscountAmount(template, Number(opts.amount));
  return {
    user_coupon_id: Number(coupon.id),
    discount_amount,
    payable_amount: Number(Math.max(0, Number(opts.amount) - discount_amount).toFixed(2)),
  };
}

export async function useCoupon(opts, think) {
  if (!opts?.tenant_id) throw new Error("tenant_id is required");
  if (!opts?.user_coupon_id) throw new Error("user_coupon_id is required");
  if (!opts?.biz_type) throw new Error("biz_type is required");
  if (!opts?.biz_id) throw new Error("biz_id is required");
  const tenant_id = Number(opts.tenant_id);
  const discount = await calculateDiscount.call(this, opts, think);
  const coupon = await this.findOne({ tenant_id, id: Number(opts.user_coupon_id) });
  await this.update({ tenant_id, id: Number(coupon.id), status: "unused" }, {
    status: "used",
    locked_biz_type: String(opts.biz_type),
    locked_biz_id: Number(opts.biz_id),
    used_at: now(),
  });
  const record = await think.service("promote.coupon.use.record.createUseRecord", {
    tenant_id,
    user_coupon_id: Number(coupon.id),
    user_id: Number(coupon.user_id),
    biz_type: String(opts.biz_type),
    biz_id: Number(opts.biz_id),
    discount_amount: discount.discount_amount,
  });
  return { ...discount, coupon: await this.findOne({ tenant_id, id: Number(coupon.id) }), record };
}
