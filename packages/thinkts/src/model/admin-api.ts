import type { ThinkContext } from "../types";
import type { DslAppData, DslModelEntry, DslTableEntry, TableColumnDSL } from "./registry";
import type { ColumnDSL } from "./registry";

// ── Response types ──

export interface MenuNode {
  key: string;
  label: string;
  icon: string;
  children?: MenuNode[];
}

export interface TableMeta {
  name: string;
  title: string;
  model: string;
}

export interface ColumnMeta {
  field: string;
  title: string;
  width?: number;
  sortable?: boolean;
  type?: string;
}

export interface SearchFieldMeta {
  field: string;
  label: string;
  type?: string;
  operator?: string;
  options?: Array<{ label: string; value: unknown }>;
}

export interface FormFieldMeta {
  field: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
}

export interface FormGroupMeta {
  title?: string;
  columns?: number;
  fields: FormFieldMeta[];
}

export interface TableConfig {
  title: string;
  model: string;
  primaryKey: string;
  list: {
    columns: ColumnMeta[];
    pageSize: number;
    orderBy?: { field: string; direction: "asc" | "desc" };
  };
  search: {
    fields: SearchFieldMeta[];
    showCount: number;
  };
  form: {
    groups: FormGroupMeta[];
  };
  /** Per-column JSON key schemas for the interactive editor. */
  jsonSchema?: Record<string, Array<{ key: string; label: string; type: string; default?: unknown }>>;
}

export interface ListResponse {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SingleResponse {
  data: Record<string, unknown> | null;
}

export interface OkResponse {
  ok: boolean;
}


const LABEL_MAP: Record<string, string> = {
  // ── Module/group names (concise, ≤4 chars) ──
  platform: "平台管理",
  identity: "身份管理",
  trade: "交易管理",
  payment: "支付管理",
  promote: "推广管理",
  permission: "权限管理",
  iotbiz: "物联网",
  mall: "商城",
  cms: "内容管理",
  system: "系统管理",
  base: "基础数据",
  platform_tenant: "租户",
  platform_tenant_module: "租户模块",
  identity_user: "用户",
  identity_dept: "部门",
  identity_login_log: "登录日志",
  permission_role: "角色",
  permission_role_permission: "角色权限",
  permission_menu: "菜单权限",
  permission_data_scope: "数据范围",
  permission_data_resource: "数据资源",
  permission_user_role: "用户角色",
  permission_tenant_permission: "租户权限",
  trade_order: "交易订单",
  trade_order_item: "订单明细",
  trade_settle_order: "结算单",
  payment_order: "支付单",
  payment_refund: "退款单",
  payment_channel: "支付渠道",
  payment_callback_log: "回调日志",
  promote_coupon: "优惠券",
  promote_user_coupon: "用户优惠券",
  promote_coupon_use_record: "使用记录",
  promote_commission_rule: "佣金规则",
  promote_commission_record: "佣金记录",
  promote_agent_relation: "代理关系",
  promote_activity: "活动",
  promote_activity_participant: "活动参与",
  promote_distribution_record: "分销记录",
  content_article: "文章",
  content_category: "分类",
  iotbiz_device: "设备",
  iotbiz_device_category: "设备分类",
  iotbiz_device_type: "设备型号",
  iotbiz_device_sku: "设备SKU",
  iotbiz_device_profile: "设备档案",
  iotbiz_device_usage_record: "用量记录",
  iotbiz_command_log: "指令日志",
  iotbiz_site: "站点",
  iotbiz_merchant: "商户",
  iotbiz_campaign: "营销活动",
  iotbiz_entitlement: "权益",
  iotbiz_package: "套餐",
  iotbiz_package_order: "套餐订单",
  iotbiz_param_template: "参数模板",
  iotbiz_recharge_order: "充值订单",
  iotbiz_revenue_share: "分账",
  iotbiz_session: "会话",
  mall_product: "商品",
  mall_order: "商城订单",
  mall_order_item: "订单明细",
  base: "基础数据",
  promote_agent_level: "代理等级",
  promote_agent: "代理",
  promote_coupon_template: "优惠券模板",
  promote_coupon_scope: "优惠券范围",
  permission_permission: "权限管理",
  id: "ID",
  tenant_id: "租户",
  username: "用户名",
  phone: "手机号",
  email: "邮箱",
  password_hash: "密码",
  nickname: "昵称",
  avatar: "头像",
  gender: "性别",
  user_type: "用户类型",
  main_dept_id: "主部门",
  dept_ids_json: "部门列表",
  status: "状态",
  last_login_at: "最后登录",
  created_at: "创建时间",
  updated_at: "更新时间",
  deleted_at: "删除时间",
  code: "编码",
  name: "名称",
  expire_at: "到期时间",
  admin_user_id: "管理员",
  package_id: "套餐",
  config_json: "配置",
  parent_id: "父级",
  sort: "排序",
  icon: "图标",
  path: "路径",
  method: "方法",
  description: "描述",
  amount: "金额",
  order_no: "订单号",
  pay_status: "支付状态",
  pay_time: "支付时间",
  device_no: "设备编号",
  merchant_id: "商户",
  agent_id: "代理",
  type_id: "型号",
  location_label: "位置",
  online_status: "在线状态",
  start_mode: "启动模式",
  pricing_json: "定价",
  start_config_json: "启动配置",
  last_heartbeat_at: "最后心跳",
  last_start_at: "最后启动",
  metadata_json: "元数据",
  // ── Generated field translations ──
  address: "地址",
  agent_no: "代理编号",
  ancestor_agent_id: "祖先代理",
  asset_type: "资产类型",
  benefits_json: "权益配置",
  billing_mode: "计费模式",
  biz_id: "业务ID",
  biz_type: "业务类型",
  bonus_amount: "赠送金额",
  callback_type: "回调类型",
  campaign_type: "活动类型",
  category: "分类",
  category_id: "分类",
  channel_code: "渠道编码",
  channel_id: "渠道",
  channel_name: "渠道名称",
  charge_type: "计费类型",
  closed_at: "关闭时间",
  command_type: "指令类型",
  commission_amount: "佣金金额",
  commission_rate: "佣金率",
  component: "组件",
  condition_json: "条件配置",
  consume_mode: "消费模式",
  contact_name: "联系人",
  contact_phone: "联系电话",
  contact_user_id: "联系人",
  content: "内容",
  coupon_no: "券编号",
  coupon_template_id: "优惠券模板",
  coupon_type: "优惠券类型",
  created_by: "创建人",
  default_duration_seconds: "默认时长(秒)",
  default_unit_price: "默认单价",
  depth: "深度",
  descendant_agent_id: "后代代理",
  device_capacity: "设备容量",
  device_id: "设备",
  device_scope_json: "设备范围",
  discount_amount: "折扣金额",
  discount_rate: "折扣率",
  duration_seconds: "时长(秒)",
  end_at: "结束时间",
  ended_at: "结束时间",
  expires_at: "到期时间",
  extra_json: "扩展配置",
  face_value: "面值",
  fail_reason: "失败原因",
  fault_threshold_json: "故障阈值",
  finished_at: "完成时间",
  grant_amount: "授权金额",
  handle_status: "处理状态",
  headers_json: "请求头",
  include_type: "包含类型",
  ip: "IP",
  item_id: "项目ID",
  item_name: "项目名称",
  item_type: "项目类型",
  latitude: "纬度",
  level: "等级",
  level_id: "等级",
  locked_at: "锁定时间",
  locked_biz_id: "锁定业务ID",
  locked_biz_type: "锁定业务类型",
  login_type: "登录类型",
  longitude: "经度",
  merchant_no: "商户编号",
  merchant_share_rate: "商户分成比例",
  module_code: "模块编码",
  order_id: "订单",
  original_price: "原价",
  owner_user_id: "所属用户",
  package_order_id: "套餐订单",
  package_quantity: "套餐数量",
  package_scope_json: "套餐范围",
  package_type: "套餐类型",
  paid_at: "支付时间",
  parent_agent_id: "上级代理",
  parent_code: "父编码",
  pay_amount: "支付金额",
  pay_no: "支付单号",
  payable_amount: "应付金额",
  payment_order_id: "支付单",
  per_user_limit: "每人限制",
  permission_code: "权限编码",
  price: "单价",
  product_id: "商品",
  product_name: "商品名称",
  profile_id: "档案",
  provider: "供应商",
  published_at: "发布时间",
  quantity: "数量",
  rate: "比率",
  received_at: "领取时间",
  receiver_type: "接收方类型",
  recharge_amount: "充值金额",
  recharge_no: "充值单号",
  refund_no: "退款单号",
  remaining_duration_seconds: "剩余时长(秒)",
  remaining_quantity: "剩余量",
  remaining_times: "剩余次数",
  request_payload_json: "请求参数",
  response_payload_json: "响应参数",
  role_id: "角色",
  rule_json: "规则配置",
  rule_type: "规则类型",
  sale_mode: "销售模式",
  sale_price: "售价",
  scope_type: "范围类型",
  session_id: "会话",
  session_no: "会话编号",
  settle_order_id: "结算单",
  settlement_cycle: "结算周期",
  signed_at: "签约时间",
  site_no: "站点编号",
  sku_id: "SKU",
  sort_order: "排序",
  start_at: "开始时间",
  start_command_json: "启动指令",
  start_payload_json: "启动参数",
  started_at: "开始时间",
  status_json: "状态配置",
  template_id: "模板",
  third_refund_no: "第三方退款号",
  third_trade_no: "第三方交易号",
  threshold_amount: "门槛金额",
  total_duration_seconds: "总时长(秒)",
  total_quantity: "总量",
  total_times: "总次数",
  trade_order_id: "交易订单",
  unit_price: "单价",
  usage_type: "用途类型",
  used_amount: "已用金额",
  used_at: "使用时间",
  user_agent: "用户代理",
  user_coupon_id: "用户优惠券",
  user_id: "用户",
  valid_days: "有效天数",
  valid_end_at: "有效期结束",
  valid_start_at: "有效期开始",
  version: "版本",
  type: "类型",
  reason: "原因",
  request_body: "请求体",
  idempotent_key: "幂等键",
  scene_code: "场景编码",
  scope_value: "范围值",
  title: "标题",
  granted_amount: "授权金额",
  device_type_scope_json: "设备类型范围",
  receiver_id: "接收方",
  entitlement_id: "权益",
  finish_reason: "完成原因",
  dept_id: "部门",
  valid_type: "有效类型",
  verify_status: "验证状态",
};

/** Resolve a human label: try title first, then field name, then as-is. */
function zh(text: string, field?: string): string {
  if (LABEL_MAP[text]) return LABEL_MAP[text];
  if (field && LABEL_MAP[field]) return LABEL_MAP[field];
  return text;
}

const ICON_MAP: Record<string, string> = {
  tenant: "Building", identity: "Users", permission: "Shield",
  trade: "ShoppingCart", payment: "CreditCard", promote: "Megaphone",
  cms: "FileText", system: "Settings",
};

function moduleIcon(name: string): string { return ICON_MAP[name] ?? "Folder"; }

/** Capitalize first letter. */
function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }

function columnType(col: ColumnDSL): string {
  if (col.options?.length) return "select";
  switch (col.type) {
    case "bigint": case "int": case "integer": case "tinyint": case "smallint": case "float": case "double": case "decimal":
      return "number";
    case "timestamp": case "datetime": case "date":
      return "date";
    case "text": case "longtext": case "mediumtext":
      return "textarea";
    case "boolean": case "tinyint(1)":
      return "switch";
    default:
      return "text";
  }
}

function resolveColType(field: string, cols: ColumnDSL[]): string {
  // Field-name-based overrides
  if (field.includes("password")) return "password";
  if (field.endsWith("_json")) return "json";
  return columnType(cols.find((c) => c.name === field) ?? { name: field, type: "varchar" });
}

function buildTableConfig(entry: DslTableEntry, modelEntry: DslModelEntry): TableConfig {
  const { table } = entry;
  const rawColumns = table.list?.columns ?? modelEntry.dsl.columns.map((c) => ({
    field: c.name,
    title: zh(c.label ?? c.name, c.name),
    sortable: true,
  }));
  const colMetas: ColumnMeta[] = rawColumns.map((tc) => ({
    field: tc.field,
    title: zh(tc.title, tc.field),
    width: "width" in tc ? (tc as TableColumnDSL).width : undefined,
    sortable: tc.sortable ?? false,
    type: resolveColType(tc.field, modelEntry.dsl.columns),
  }));

  const searchFields: SearchFieldMeta[] = (table.search?.fields ?? []).map((sf) => ({
    field: sf.field,
    label: zh(sf.title, sf.field),
    type: sf.type,
    operator: sf.operator,
    options: sf.options,
  }));
  const formGroups: FormGroupMeta[] = (table.form?.groups ?? []).map((g) => ({
    title: g.title,
    columns: g.columns,
    fields: (g.fields ?? []).map((f) => ({
      field: f.field,
      label: zh(f.title, f.field),
      type: resolveColType(f.field, modelEntry.dsl.columns),
      required: f.required ?? false,
      options: f.options,
    })),
  }));

  const orderBy = table.list?.orderBy;
  return {
    title: zh(table.title),
    model: table.model,
    primaryKey: modelEntry.dsl.primaryKey ?? "id",
    list: {
      columns: colMetas,
      pageSize: table.list?.pageSize ?? 20,
      orderBy: orderBy ? { field: orderBy.field, direction: orderBy.direction ?? "desc" } : undefined,
    },
    search: {
      fields: searchFields,
      showCount: table.search?.showCount ?? 4,
    },
    form: { groups: formGroups },
    jsonSchema: (modelEntry.dsl as Record<string, unknown>).jsonSchema as TableConfig["jsonSchema"],
  };
}

// ── Handler factory ──

export interface AdminHandlers {
  menusAction(ctx: ThinkContext): Promise<{ menus: MenuNode[] }>;
  tablesAction(): { tables: TableMeta[] };
  tableConfigAction(model: string): { table: TableConfig } | { error: string };
  listAction(ctx: ThinkContext, model: string): Promise<{ list: ListResponse }>;
  formConfigAction(model: string): { form: FormGroupMeta[] } | { error: string };
  getRecordAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> | null }>;
  createAction(ctx: ThinkContext, model: string): Promise<{ data: Record<string, unknown> }>;
  updateAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> }>;
  deleteAction(ctx: ThinkContext, model: string, id: string): Promise<{ ok: boolean }>;
}

export function createAdminApiHandlers(dslData: DslAppData): AdminHandlers {
  const modelEntries = Object.values(dslData.models);
  const tableEntries = Object.values(dslData.tables);

  // Model lookup (name may include prefix like "tenant_platform_tenant")
  function findModel(name: string): DslModelEntry | undefined {
    return dslData.models[name] ?? modelEntries.find((e) => e.name === name || e.name.endsWith(`_${name}`));
  }

  function findTable(name: string): DslTableEntry | undefined {
    return dslData.tables[name] ?? tableEntries.find((e) => e.name === name || e.name.endsWith(`_${name}`));
  }

  function buildMenuTree(): MenuNode[] {
    const modules: Record<string, DslTableEntry[]> = {};
    for (const entry of tableEntries) {
      const mod = entry.name.split("_")[0] ?? "system";
      (modules[mod] ??= []).push(entry);
    }

    const nodes: MenuNode[] = [];
    for (const [mod, entries] of Object.entries(modules)) {
      const children: MenuNode[] = entries.map((e) => ({
        key: `/resources/${e.name}`,
        label: zh(e.table.title ?? e.name),
        icon: "Table",
      }));
      nodes.push({
        key: `/${mod}`,
        label: zh(mod) === mod ? capitalize(mod) : zh(mod),
        icon: moduleIcon(mod),
        children,
      });
    }
    return nodes;
  }

  function buildTablesList(): TableMeta[] {
    return tableEntries.map((e) => ({
      name: e.name,
      title: zh(e.table.title ?? e.name),
      model: e.table.model ?? e.name,
    }));
  }

  // ── tables list ──

  function buildTablesList(): TableMeta[] {
    return tableEntries.map((e) => ({
      name: e.name,
      title: e.table.title ?? e.name,
      model: e.table.model ?? e.name,
    }));
  }

  // ── Handlers ──

  async function menusAction(_ctx: ThinkContext): Promise<{ menus: MenuNode[] }> {
    return { menus: buildMenuTree() };
  }

  function tablesAction(): { tables: TableMeta[] } {
    return { tables: buildTablesList() };
  }

  function tableConfigAction(model: string): { table: TableConfig } | { error: string } {
    const entry = findTable(model);
    if (!entry) return { error: `Table not found: ${model}` };
    const modelEntry = findModel(entry.table.model ?? entry.name);
    if (!modelEntry) return { error: `Model not found for table: ${model}` };
    return { table: buildTableConfig(entry, modelEntry) };
  }

  async function listAction(ctx: ThinkContext, model: string): Promise<{ list: ListResponse }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);

    const url = new URL(ctx.request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const where: Record<string, unknown> = {};

    // Collect filter params from search fields
    const tableEntry = findTable(model);
    if (tableEntry?.table.search?.fields) {
      for (const sf of tableEntry.table.search.fields) {
        const val = url.searchParams.get(sf.field);
        if (val) where[sf.field] = val;
      }
    }

    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    let query = m.where(where);
    const sort = url.searchParams.get("sort");
    const order = url.searchParams.get("order") ?? "desc";
    if (sort) query = query.order(`${sort} ${order}`);

    const raw = await query.page(page, pageSize).countSelect();
    return {
      list: {
        items: (raw.data ?? []) as Record<string, unknown>[],
        total: Number(raw.total ?? 0),
        page,
        pageSize,
      },
    };
  }

  function formConfigAction(model: string): { form: FormGroupMeta[] } | { error: string } {
    const entry = findTable(model);
    if (!entry) return { error: `Table not found: ${model}` };
    const groups = (entry.table.form?.groups ?? []).map((g) => ({
      title: g.title,
      columns: g.columns,
      fields: (g.fields ?? []).map((f) => ({
        field: f.field,
        label: f.title,
        type: f.type,
        required: f.required ?? false,
        options: f.options,
      })),
    }));
    return { form: groups };
  }

  async function getRecordAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> | null }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const record = await m.where({ [pk]: id }).find();
    return { data: record as Record<string, unknown> | null };
  }

  async function createAction(ctx: ThinkContext, model: string): Promise<{ data: Record<string, unknown> }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const body = (ctx.body as Record<string, unknown>) ?? {};
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const record = await m.add(body);
    return { data: record as Record<string, unknown> };
  }

  async function updateAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const body = (ctx.body as Record<string, unknown>) ?? {};
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    await m.where({ [pk]: id }).update(body);
    const record = await m.where({ [pk]: id }).find();
    return { data: record as Record<string, unknown> };
  }

  async function deleteAction(ctx: ThinkContext, model: string, id: string): Promise<{ ok: boolean }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    await m.where({ [pk]: id }).delete();
    return { ok: true };
  }

  return {
    menusAction,
    tablesAction,
    tableConfigAction,
    listAction,
    formConfigAction,
    getRecordAction,
    createAction,
    updateAction,
    deleteAction,
  };
}
