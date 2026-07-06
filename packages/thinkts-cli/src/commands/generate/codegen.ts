import type { TableMeta } from "../generate";

/** snake_case → Chinese label inference */
function toLabel(name: string): string {
  const map: Record<string, string> = {
    id: "ID", tenant_id: "租户", code: "编码", name: "名称", title: "标题",
    status: "状态", type: "类型", sort: "排序", icon: "图标", path: "路径",
    username: "用户名", password_hash: "密码", phone: "手机号", email: "邮箱",
    nickname: "昵称", avatar: "头像", gender: "性别", user_type: "用户类型",
    created_at: "创建时间", updated_at: "更新时间", deleted_at: "删除时间",
    remark: "备注", description: "描述", content: "内容", config_json: "配置",
    parent_id: "父级", sort_order: "排序", level: "等级", amount: "金额",
    quantity: "数量", price: "单价", device_id: "设备", user_id: "用户",
    order_id: "订单", product_id: "商品", merchant_id: "商户", agent_id: "代理",
    session_id: "会话", role_id: "角色", dept_id: "部门", channel_id: "渠道",
    biz_id: "业务ID", biz_type: "业务类型", module_code: "模块编码",
    start_at: "开始时间", end_at: "结束时间", expire_at: "到期时间",
    paid_at: "支付时间", finished_at: "完成时间", last_login_at: "最后登录",
    last_heartbeat_at: "最后心跳", ip: "IP", url: "链接",
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
  const searchable = ["name", "title", "code", "username", "phone", "email", "nickname",
    "device_no", "order_no", "pay_no", "refund_no", "merchant_no", "agent_no", "session_no",
    "status", "user_type", "online_status", "pay_status", "gender", "start_mode",
    "tenant_id", "user_id", "device_id", "merchant_id",
  ];
  return searchable.includes(col.name) || (col.dataType !== "text" && col.dataType !== "longtext" && col.dataType !== "json");
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
  const t = col.dataType.toLowerCase();
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
