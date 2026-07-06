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
  // ── Model names → Chinese title ──
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
