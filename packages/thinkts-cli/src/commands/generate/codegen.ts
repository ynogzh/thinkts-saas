import type { TableMeta } from "../generate";

/** snake_case → Chinese label inference */
function toLabel(name: string): string {
  const map: Record<string, string> = {
    id: "ID", tenant_id: "租户", code: "编码", name: "名称", title: "标题",
    status: "状态", type: "类型", sort: "排序", icon: "图标", path: "路径",
    username: "用户名", password_hash: "密码", phone: "手机号", email: "邮箱",
    nickname: "昵称", avatar: "头像", gender: "性别", user_type: "用户类型",
    main_dept_id: "主部门", dept_ids_json: "部门列表",
    created_at: "创建时间", updated_at: "更新时间", deleted_at: "删除时间",
    last_login_at: "最后登录", expire_at: "到期时间", closed_at: "关闭时间",
    paid_at: "支付时间", finished_at: "完成时间", started_at: "开始时间",
    ended_at: "结束时间", received_at: "领取时间", used_at: "使用时间",
    signed_at: "签约时间", published_at: "发布时间",
    valid_start_at: "有效开始", valid_end_at: "有效结束",
    last_heartbeat_at: "最后心跳", last_start_at: "最后启动",
    remark: "备注", description: "描述", content: "内容",
    parent_id: "父级", sort_order: "排序", level: "等级",
    amount: "金额", discount_amount: "折扣金额", pay_amount: "支付金额",
    quantity: "数量", price: "单价", unit_price: "单价",
    recharge_amount: "充值金额", bonus_amount: "赠送金额",
    face_value: "面值", discount_rate: "折扣率",
    commission_amount: "佣金金额", commission_rate: "佣金率",
    granted_amount: "授权金额", used_amount: "已用金额",
    payable_amount: "应付金额", threshold_amount: "门槛金额",
    total_quantity: "总量", remaining_quantity: "剩余量",
    total_times: "总次数", remaining_times: "剩余次数",
    total_duration_seconds: "总时长(秒)", duration_seconds: "时长(秒)",
    validity_days: "有效天数", valid_days: "有效天数",
    settlement_cycle: "结算周期", merchant_share_rate: "商户分成",
    device_id: "设备", device_no: "设备编号", device_capacity: "设备容量",
    user_id: "用户", order_id: "订单", order_no: "订单号",
    product_id: "商品", merchant_id: "商户", merchant_no: "商户编号",
    agent_id: "代理", agent_no: "代理编号", parent_agent_id: "上级代理",
    session_id: "会话", session_no: "会话编号",
    role_id: "角色", dept_id: "部门", channel_id: "渠道",
    biz_id: "业务ID", biz_type: "业务类型",
    trade_order_id: "交易订单", payment_order_id: "支付单",
    package_order_id: "套餐订单", settle_order_id: "结算单",
    coupon_template_id: "优惠券模板", user_coupon_id: "用户优惠券",
    template_id: "模板", profile_id: "档案", sku_id: "SKU",
    level_id: "等级", category_id: "分类",
    coupon_no: "券编号", pay_no: "支付单号", refund_no: "退款单号",
    recharge_no: "充值单号", site_no: "站点编号",
    module_code: "模块编码", channel_code: "渠道编码", channel_name: "渠道名称",
    campaign_type: "活动类型", coupon_type: "优惠券类型",
    command_type: "指令类型", callback_type: "回调类型",
    login_type: "登录类型", asset_type: "资产类型",
    receiver_type: "接收方类型", sender_type: "发送方类型",
    sale_mode: "销售模式", charge_type: "计费类型", billing_mode: "计费模式",
    consume_mode: "消费模式", start_mode: "启动模式",
    online_status: "在线状态", pay_status: "支付状态",
    handle_status: "处理状态", verify_status: "验证状态",
    scope_type: "范围类型", include_type: "包含类型",
    valid_type: "有效类型", rule_type: "规则类型", package_type: "套餐类型",
    usage_type: "用途类型", item_type: "项目类型",
    device_scope_json: "设备范围", package_scope_json: "套餐范围",
    request_payload_json: "请求参数", response_payload_json: "响应参数",
    start_payload_json: "启动参数", condition_json: "条件配置",
    config_json: "配置", metadata_json: "元数据", extra_json: "扩展配置",
    benefits_json: "权益配置", rule_json: "规则配置", status_json: "状态配置",
    pricing_json: "定价配置", start_config_json: "启动配置",
    fault_threshold_json: "故障阈值", headers_json: "请求头",
    ip: "IP", url: "链接", address: "地址", reason: "原因",
    latitude: "纬度", longitude: "经度", location_label: "位置",
    contact_name: "联系人", contact_phone: "联系电话", contact_user_id: "联系人",
    finish_reason: "完成原因", fail_reason: "失败原因",
    third_trade_no: "第三方交易号", third_refund_no: "第三方退款号",
    idempotent_key: "幂等键", request_body: "请求体",
    per_user_limit: "每人限制", sales_price: "售价", original_price: "原价",
    depth: "深度", rate: "比率", version: "版本", scene_code: "场景编码",
  };
  return map[name] ?? name.replace(/_/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());
}

/** Determine if a column should appear in the list table by default. */
function isListable(col: TableMeta["columns"][number]): boolean {
  const hidden = ["id", "created_at", "updated_at", "deleted_at", "password_hash"];
  return !hidden.includes(col.name) && !col.name.endsWith("_json");
}

/** Determine if a column should appear in search fields. */
function isSearchable(col: TableMeta["columns"][number]): boolean {
  // Never search on hidden/system columns
  const hidden = ["id", "created_at", "updated_at", "deleted_at", "password_hash"];
  if (hidden.includes(col.name)) return false;
  // Explicitly searchable field names
  const searchable = ["name", "title", "code", "username", "phone", "email", "nickname",
    "device_no", "order_no", "pay_no", "refund_no", "merchant_no", "agent_no", "session_no",
    "status", "user_type", "online_status", "pay_status", "gender", "start_mode",
    "tenant_id", "user_id", "device_id", "merchant_id",
  ];
  if (searchable.includes(col.name)) return true;
  // Auto-detect: non-text, non-json, non-decimal, non-timestamp columns are likely searchable
  const t = col.dataType.toLowerCase().replace(/\(.*\)/, "");
  if (t.includes("int")) return true;  // FK/ID columns: YES
  return false;  // text, json, decimal, timestamp, date: NO by default
}

/** Detect JSON columns and infer their key schemas. */
function inferJsonSchema(colName: string, label: string): string | null {
  const schemas: Record<string, string> = {
    pricing_json: 'jsonSchema(t.json(), [{ key: "mode", label: "计费模式", type: "string", default: "mock" }, { key: "unit_price", label: "单价(分)", type: "number", default: 0 }])',
    config_json: 'jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])',
    metadata_json: 'jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])',
    extra_json: 'jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])',
    benefits_json: 'jsonSchema(t.json(), [{ key: "name", label: "权益名称", type: "string", default: "" }])',
    rule_json: 'jsonSchema(t.json(), [{ key: "rule_type", label: "规则类型", type: "string", default: "" }])',
    condition_json: 'jsonSchema(t.json(), [{ key: "condition_type", label: "条件类型", type: "string", default: "" }])',
    status_json: 'jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])',
    headers_json: 'jsonSchema(t.json(), [{ key: "notes", label: "备注", type: "string", default: "" }])',
  };
  if (schemas[colName]) return schemas[colName];
  return colName.endsWith("_json") || colName.includes("json")
    ? `jsonSchema(t.json(), [{ key: "notes", label: "${label}", type: "string", default: "" }])`
    : null;
}

function tsType(col: TableMeta["columns"][number]): string {
  const t = col.dataType.toLowerCase().replace(/\(.*\)/, "");
  if (t.includes("int") || t === "bigint" || t === "tinyint" || t === "smallint") return "t.bigint()";
  if (t === "float" || t === "double" || t === "decimal") return "t.decimal()";
  if (t === "timestamp" || t === "datetime") return "t.timestamp()";
  if (t === "date") return "t.date()";
  if (t === "boolean" || t === "tinyint(1)") return "t.boolean()";
  if (t === "text" || t === "longtext" || t === "mediumtext") return "t.text()";
  if (t === "json" || t === "jsonb") return "t.json()";
  return "t.string()";
}

function modifiers(col: TableMeta["columns"][number]): string[] {
  const m: string[] = [];
  if (col.isPrimary) m.push("primary");
  if (col.autoIncrement) m.push("autoIncrement");
  if (!col.nullable && col.defaultValue === undefined && !col.isPrimary) m.push("required");
  if (col.nullable) m.push("nullable");
  if (col.isUnique) m.push("unique");
  if (col.isIndex) m.push("index");
  return m;
}

function colDef(col: TableMeta["columns"][number]): string {
  const label = toLabel(col.name);
  let base = tsType(col);

  // JSON schema detection
  const jsonSchema = (col.dataType === "json" || col.dataType === "jsonb" || col.name.endsWith("_json"))
    ? inferJsonSchema(col.name, label) : null ;

  // Apply modifiers using wrapper style
  const mods = modifiers(col);
  for (const m of mods) base = `${m}(${base})`;

  let line = `    ${col.name}:`;
  if (isListable(col) || isSearchable(col)) {
    line += ` label("${label}")(`;
    if (isListable(col)) line += "listable(";
    if (isSearchable(col)) line += "searchable(";
    line += base;
    for (let i = 0; i < (isListable(col) ? 1 : 0) + (isSearchable(col) ? 1 : 0); i++) line += ")";
    line += ")";
  } else {
    line += ` ${base}`;
  }

  if (jsonSchema) line += `,  // ${jsonSchema}`;

  return line;
}

/** Generate model.ts with defineModel, column labels, jsonSchema, system, access. */
export function generateModelTs(table: TableMeta): string {
  const columns = table.columns.map(colDef);
  const modelName = table.name;

  // Infer system config
  const hasTenantId = table.columns.some((c) => c.name === "tenant_id");
  const hasDeletedAt = table.columns.some((c) => c.name === "deleted_at");

  return `import { defineModel, t, label, listable, searchable, required, nullable, primary, autoIncrement, unique, index, jsonSchema } from "thinkts";

/**
 * ${modelName} — ${table.comment ?? "auto-generated from database"}
 */
export default defineModel("${modelName}", {
  columns: {
${columns.join(",\n")}
  },

  hooks: {},

  system: {
${hasTenantId ? "    tenantAware: true,\n" : ""}${hasDeletedAt ? "    softDelete: true,\n" : ""}  },

  access: {},
});
`;
}

export function generateServiceTs(): string {
  return `import { BaseService, Params } from "thinkts";

export default class Service extends BaseService {
  // Add your service methods here
}
`;
}

// Backward compat
export { generateModelTs as generateModelJs };
export function generateTableJs(table: TableMeta): string { return generateModelTs(table); }
export function generateTableJson(table: TableMeta): string { return generateModelTs(table); }
export function generateModelJson(table: TableMeta): string { return generateModelTs(table); }
export function generateAclJson(): string { return "{}"; }
export function generateServiceJs(): string { return generateServiceTs(); }
export function generateTableTs(): string { return generateModelTs({ name: "", columns: [], indexes: [], comment: "" }); }
