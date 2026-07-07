import type { ThinkContext } from "../types";
import type { DslAppData, DslModelEntry, DslTableEntry, TableColumnDSL } from "./registry";
import type { ColumnDSL } from "./registry";
import type { ValidationRules } from "./columns";

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
  /** If this is a foreign key, the display field from the referenced model (e.g., "name"). */
  displayField?: string;
  /** The referenced model name (e.g., "platform_tenant"). */
  refModel?: string;
  /** If false, render FK as plain text (no link/dialog). Defaults to true for most FK columns. */
  linkable?: boolean;
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
  maxLength?: number;
  options?: Array<{ label: string; value: unknown }>;
  validation?: ValidationRules;
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
  /** UI actions configured in model definition. */
  uiActions?: Array<{ label: string; service: string; icon?: string }>;
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
  operation: "运营管理",
  config: "系统配置",
  channel: "渠道管理",
  account: "账户管理",
  event: "事件管理",
  dashboard: "仪表盘",
  channel_channel: "渠道",
  channel_invite_code: "邀请码",
  channel_source_record: "渠道来源",
  config_setting: "系统设置",
  config_dict: "字典",
  config_dict_item: "字典项",
  config_file: "文件",
  config_audit_log: "审计日志",
  config_operation_log: "操作日志",
  event_record: "事件记录",
  event_webhook_config: "Webhook配置",
  event_webhook_log: "Webhook日志",
  platform_module: "模块管理",
  platform_package: "套餐包",
  account_asset: "账户资产",
  account_asset_record: "资产记录",
  account_freeze_record: "冻结记录",
  dashboard_dashboard: "仪表盘",
  dashboard_data_source: "数据源",
  dashboard_widget: "组件",
  operation_ad: "广告",
  operation_ad_position: "广告位",
  operation_tag: "标签",
  operation_tag_relation: "标签关联",
  operation_ticket: "工单",
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
  promote_agent_level: "代理等级",
  promote_agent: "代理",
  promote_coupon_template: "优惠券模板",
  promote_coupon_scope: "优惠券范围",
  permission_permission: "权限管理",
  action: "操作",
  address: "地址",
  admin_user_id: "管理员",
  after_data: "操作后数据",
  agent_field: "代理字段",
  agent_id: "代理",
  agent_no: "代理编号",
  amount: "金额",
  ancestor_agent_id: "祖先代理",
  api_method: "API方法",
  api_path: "API路径",
  api_url: "API地址",
  asset_type: "资产类型",
  avatar: "头像",
  balance: "余额",
  balance_after: "操作后余额",
  before_data: "操作前数据",
  benefits_json: "权益配置",
  billing_mode: "计费模式",
  biz_id: "业务ID",
  biz_type: "业务类型",
  bonus_amount: "赠送金额",
  callback_type: "回调类型",
  campaign_type: "活动类型",
  category: "分类",
  category_id: "分类",
  change_amount: "变动金额",
  change_type: "变动类型",
  channel_code: "渠道编码",
  channel_id: "渠道",
  channel_name: "渠道名称",
  charge_type: "计费类型",
  closed_at: "关闭时间",
  code: "编码",
  color: "颜色",
  command_type: "指令类型",
  commission_amount: "佣金金额",
  commission_rate: "佣金率",
  component: "组件",
  condition_json: "条件配置",
  config_json: "配置",
  config_key: "配置键",
  config_value: "配置值",
  consume_count: "消耗次数",
  consume_mode: "消费模式",
  contact_name: "联系人",
  contact_phone: "联系电话",
  contact_user_id: "联系人",
  content: "内容",
  coupon_no: "券编号",
  coupon_template_id: "优惠券模板",
  coupon_type: "优惠券类型",
  created_at: "创建时间",
  created_by: "创建人",
  dashboard_id: "仪表盘",
  data_source_code: "数据源编码",
  default_duration_seconds: "默认时长(秒)",
  default_unit_price: "默认单价",
  deleted_at: "删除时间",
  dept_field: "部门字段",
  dept_id: "部门",
  dept_ids_json: "部门列表",
  depth: "深度",
  descendant_agent_id: "后代代理",
  description: "描述",
  device_capacity: "设备容量",
  device_id: "设备",
  device_no: "设备编号",
  device_scope_json: "设备范围",
  device_type_scope_json: "设备类型范围",
  dict_code: "字典编码",
  dict_name: "字典名称",
  discount_amount: "折扣金额",
  discount_rate: "折扣率",
  duration_seconds: "时长(秒)",
  email: "邮箱",
  end_at: "结束时间",
  ended_at: "结束时间",
  entitlement_id: "权益",
  event_code: "事件编码",
  event_type: "事件类型",
  expire_at: "到期时间",
  expires_at: "到期时间",
  extra_json: "扩展配置",
  face_value: "面值",
  fail_reason: "失败原因",
  fault_threshold_json: "故障阈值",
  file_name: "文件名",
  file_size: "文件大小",
  file_type: "文件类型",
  file_url: "文件URL",
  finish_reason: "完成原因",
  finished_at: "完成时间",
  freeze_amount: "冻结金额",
  frozen_balance: "冻结余额",
  gender: "性别",
  grant_amount: "授权金额",
  granted_amount: "授权金额",
  handle_status: "处理状态",
  headers_json: "请求头",
  icon: "图标",
  id: "ID",
  idempotent_key: "幂等键",
  image_url: "图片URL",
  include_type: "包含类型",
  ip: "IP",
  item_id: "项目ID",
  item_label: "项标签",
  item_name: "项目名称",
  item_type: "项目类型",
  item_value: "项值",
  last_error: "最近错误",
  last_heartbeat_at: "最后心跳",
  last_login_at: "最后登录",
  last_start_at: "最后启动",
  latitude: "纬度",
  level: "等级",
  level_id: "等级",
  level1: "一级",
  location_label: "位置",
  locked_at: "锁定时间",
  locked_biz_id: "锁定业务ID",
  locked_biz_type: "锁定业务类型",
  login_type: "登录类型",
  longitude: "经度",
  main_dept_id: "主部门",
  merchant_id: "商户",
  merchant_no: "商户编号",
  merchant_share_rate: "商户分成比例",
  metadata_json: "元数据",
  method: "方法",
  module_code: "模块编码",
  name: "名称",
  next_retry_at: "下次重试",
  nickname: "昵称",
  online_status: "在线状态",
  order_id: "订单",
  order_no: "订单号",
  original_price: "原价",
  owner_field: "所属字段",
  owner_id: "所属ID",
  owner_type: "所属类型",
  owner_user_id: "所属用户",
  package_id: "套餐",
  package_order_id: "套餐订单",
  package_quantity: "套餐数量",
  package_scope_json: "套餐范围",
  package_type: "套餐类型",
  paid_at: "支付时间",
  parent_agent_id: "上级代理",
  parent_code: "父编码",
  parent_id: "父级",
  password_hash: "密码",
  path: "路径",
  pay_amount: "支付金额",
  pay_no: "支付单号",
  pay_status: "支付状态",
  pay_time: "支付时间",
  payable_amount: "应付金额",
  payload: "请求体",
  payment_order_id: "支付单",
  per_user_limit: "每人限制",
  permission_code: "权限编码",
  phone: "手机号",
  position_id: "广告位",
  price: "单价",
  pricing_json: "定价",
  priority: "优先级",
  product_id: "商品",
  product_name: "商品名称",
  profile_id: "档案",
  provider: "供应商",
  published_at: "发布时间",
  quantity: "数量",
  query_type: "查询类型",
  rate: "比率",
  reason: "原因",
  received_at: "领取时间",
  receiver_id: "接收方",
  receiver_type: "接收方类型",
  recharge_amount: "充值金额",
  recharge_no: "充值单号",
  referer: "来源",
  refund_no: "退款单号",
  region_field: "区域字段",
  remaining_duration_seconds: "剩余时长(秒)",
  remaining_quantity: "剩余量",
  remaining_times: "剩余次数",
  request_body: "请求体",
  request_payload_json: "请求参数",
  resource_code: "资源编码",
  resource_name: "资源名称",
  response: "响应",
  response_payload_json: "响应参数",
  retry_count: "重试次数",
  role_id: "角色",
  rule_json: "规则配置",
  rule_type: "规则类型",
  sale_mode: "销售模式",
  sale_price: "售价",
  scene_code: "场景编码",
  scope_type: "范围类型",
  scope_value: "范围值",
  secret: "密钥",
  session_id: "会话",
  session_no: "会话编号",
  settle_no: "结算单号",
  settle_order_id: "结算单",
  settle_type: "结算类型",
  settled_at: "结算时间",
  settlement_cycle: "结算周期",
  signed_at: "签约时间",
  site_no: "站点编号",
  sku_id: "SKU",
  sort: "排序",
  sort_order: "排序",
  source_url: "来源URL",
  sql_template: "SQL模板",
  start_at: "开始时间",
  start_command_json: "启动指令",
  start_config_json: "启动配置",
  start_mode: "启动模式",
  start_payload_json: "启动参数",
  started_at: "开始时间",
  status: "状态",
  status_json: "状态配置",
  storage_limit: "存储上限",
  storage_provider: "存储供应商",
  table_name: "表名",
  tag_id: "标签",
  target_id: "目标ID",
  target_type: "目标类型",
  target_url: "目标URL",
  template_id: "模板",
  tenant_field: "租户字段",
  tenant_id: "租户",
  third_refund_no: "第三方退款号",
  third_trade_no: "第三方交易号",
  threshold_amount: "门槛金额",
  title: "标题",
  total_duration_seconds: "总时长(秒)",
  total_quantity: "总量",
  total_times: "总次数",
  trade_order_id: "交易订单",
  type: "类型",
  type_id: "型号",
  unit_price: "单价",
  updated_at: "更新时间",
  usage_type: "用途类型",
  used_amount: "已用金额",
  used_at: "使用时间",
  user_agent: "用户代理",
  user_coupon_id: "用户优惠券",
  user_id: "用户",
  user_limit: "用户上限",
  user_type: "用户类型",
  username: "用户名",
  valid_days: "有效天数",
  valid_end_at: "有效期结束",
  valid_start_at: "有效期开始",
  valid_type: "有效类型",
  value_type: "值类型",
  verify_status: "验证状态",
  version: "版本",
  widget_type: "组件类型",
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

/** Generate search field options for common enum columns when none are explicitly defined. */
function searchFieldOptions(field: string, col: ColumnDSL): SearchFieldMeta["options"] {
  // Use explicit model options if available
  if (col.options?.length) {
    return col.options.map((o) => {
      if (typeof o === "string") return { label: o, value: o };
      return { label: o.label, value: o.value };
    });
  }
  // Infer from common field patterns
  const inferred: Record<string, Array<{ label: string; value: unknown }>> = {
    status: [{ label: "启用", value: "enabled" }, { label: "禁用", value: "disabled" }],
    online_status: [{ label: "在线", value: "online" }, { label: "离线", value: "offline" }],
    user_type: [{ label: "超级管理员", value: "superadmin" }, { label: "管理员", value: "admin" }, { label: "用户", value: "customer" }],
    gender: [{ label: "男", value: "male" }, { label: "女", value: "female" }],
    start_mode: [{ label: "模拟", value: "mock" }, { label: "真实", value: "real" }],
    pay_status: [{ label: "未支付", value: "unpaid" }, { label: "已支付", value: "paid" }, { label: "已退款", value: "refunded" }],
    scope_type: [{ label: "全部", value: "all" }, { label: "指定", value: "specific" }],
    include_type: [{ label: "包含", value: "include" }, { label: "排除", value: "exclude" }],
    coupon_type: [{ label: "满减", value: "discount" }, { label: "折扣", value: "rate" }],
    valid_type: [{ label: "固定时间", value: "fixed" }, { label: "领取后天数", value: "days" }],
    campaign_type: [{ label: "满减", value: "discount" }, { label: "赠品", value: "gift" }],
    sale_mode: [{ label: "售卖", value: "sale" }, { label: "租赁", value: "rent" }],
    charge_type: [{ label: "按时", value: "hourly" }, { label: "按次", value: "per_use" }, { label: "包月", value: "monthly" }],
    consume_mode: [{ label: "按时", value: "hourly" }, { label: "按次", value: "per_use" }],
    usage_type: [{ label: "按时", value: "hourly" }, { label: "按次", value: "per_use" }],
    billing_mode: [{ label: "按时", value: "hourly" }, { label: "按次", value: "per_use" }, { label: "包月", value: "monthly" }],
    asset_type: [{ label: "余额", value: "balance" }, { label: "积分", value: "points" }],
    receiver_type: [{ label: "商户", value: "merchant" }, { label: "代理", value: "agent" }],
    rule_type: [{ label: "固定比例", value: "fixed_rate" }, { label: "阶梯", value: "tiered" }],
    package_type: [{ label: "计时", value: "duration" }, { label: "计次", value: "times" }, { label: "充值", value: "recharge" }],
    item_type: [{ label: "产品", value: "product" }, { label: "服务", value: "service" }],
    biz_type: [{ label: "设备", value: "device" }, { label: "套餐", value: "package" }, { label: "充值", value: "recharge" }, { label: "商城", value: "mall" }],
    command_type: [{ label: "启动", value: "start" }, { label: "停止", value: "stop" }],
    callback_type: [{ label: "支付回调", value: "pay" }, { label: "退款回调", value: "refund" }],
    login_type: [{ label: "密码登录", value: "password" }, { label: "短信登录", value: "sms" }],
    settlement_cycle: [{ label: "每天", value: "daily" }, { label: "每周", value: "weekly" }, { label: "每月", value: "monthly" }],
    handle_status: [{ label: "待处理", value: "pending" }, { label: "已完成", value: "done" }, { label: "失败", value: "failed" }],
    verify_status: [{ label: "待验证", value: "pending" }, { label: "已验证", value: "verified" }, { label: "失败", value: "failed" }],
  };
  return inferred[field];
}

function buildTableConfig(entry: DslTableEntry, modelEntry: DslModelEntry, models: Record<string, DslModelEntry>): TableConfig {
  const { table } = entry;
  const rawColumns = table.list?.columns ?? modelEntry.dsl.columns.map((c) => ({
    field: c.name,
    title: zh(c.label ?? c.name, c.name),
    sortable: true,
  }));
  const colMetas: ColumnMeta[] = rawColumns.map((tc) => {
    const meta: ColumnMeta = {
      field: tc.field,
      title: zh(tc.title, tc.field),
      width: "width" in tc ? (tc as TableColumnDSL).width : undefined,
      sortable: tc.sortable ?? false,
      type: resolveColType(tc.field, modelEntry.dsl.columns),
    };
    // Detect foreign keys and find display field from referenced model
    if (tc.field.endsWith("_id") && tc.field !== "id") {
      const refModelName = tc.field.replace(/_id$/, "");
      // Try to find the referenced model
      const refModel = models[refModelName] ?? Object.values(models).find((m) => m.name.endsWith(`_${refModelName}`));
      if (refModel) {
        const dsl = refModel.dsl as Record<string, unknown>;
        const ui = dsl.ui as Record<string, unknown> | undefined;
        const displayField = (ui?.displayField as string) ?? "name";
        // Check if display field exists in the referenced model
        if (refModel.dsl.columns.some((c) => c.name === displayField)) {
          meta.displayField = displayField;
          meta.refModel = refModel.name;
          // Determine if FK should be rendered as a clickable link
          const excludeFields = ['tenant_id', 'parent_id', 'created_by', 'updated_by', 'deleted_by', 'locked_biz_id', 'locked_biz_type', 'owner_id', 'owner_type'];
          meta.linkable = !(excludeFields.includes(tc.field) || tc.field.endsWith('_field'));
        }
      }
    }
    return meta;
  });

  const searchFields: SearchFieldMeta[] = (table.search?.fields ?? []).map((sf) => {
    const col = modelEntry.dsl.columns.find((c) => c.name === sf.field);
    return {
      field: sf.field,
      label: zh(sf.title, sf.field),
      type: sf.type,
      operator: sf.operator,
      options: searchFieldOptions(sf.field, col ?? { name: sf.field, type: "varchar" }),
    };
  });
  const formGroups: FormGroupMeta[] = (table.form?.groups ?? []).map((g) => ({
    title: g.title,
    columns: g.columns,
    fields: (g.fields ?? []).map((f) => {
      const meta: FormFieldMeta = {
        field: f.field,
        label: zh(f.title, f.field),
        type: resolveColType(f.field, modelEntry.dsl.columns),
        required: f.required ?? false,
        options: f.options,
      };
      if (f.validation) meta.validation = f.validation as FormFieldMeta['validation'];
      return meta;
    }),
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
    uiActions: ((modelEntry.dsl as Record<string, unknown>).ui as Record<string, unknown>)?.actions as TableConfig["uiActions"],
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
  batchLookupAction(ctx: ThinkContext): Promise<Record<string, Record<string, string>>>;
  entityDetailAction(ctx: ThinkContext, model: string, id: string): Promise<{ data: Record<string, unknown> | null }>;
  entityListAction(ctx: ThinkContext): Promise<{ data: Record<string, unknown>[] }>;
  exportCsvAction(ctx: ThinkContext, model: string): Promise<Record<string, unknown>>;
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
    return { table: buildTableConfig(entry, modelEntry, dslData.models) };
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
    const items = (raw.data ?? []) as Record<string, unknown>[];

    return {
      list: {
        items,
        total: Number(raw.total ?? 0),
        page,
        pageSize,
      },
    };
  }

  // ── batch FK lookup (client-side) ──

  async function batchLookupAction(ctx: ThinkContext): Promise<Record<string, Record<string, string>>> {
    const body = (ctx.body ?? {}) as { lookups?: Array<{ model: string; ids: (number | string)[]; field: string }> };
    const lookups = body.lookups ?? [];
    const result: Record<string, Record<string, string>> = {};

    for (const lk of lookups) {
      const modelEntry = findModel(lk.model);
      if (!modelEntry) continue;
      const ids = lk.ids.filter(Boolean);
      if (ids.length === 0) continue;
      const field = lk.field ?? "name";
      const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
      const rows = await m.where({ id: ["in", ids] } as unknown as Record<string, unknown>).field([["id", field].join(",")]).select() as Record<string, unknown>[];
      const map: Record<string, string> = {};
      for (const row of rows) {
        map[String(row.id)] = String(row[field] ?? row.id ?? "");
      }
      result[lk.model] = map;
    }
    return result;
  }

  async function entityListAction(ctx: ThinkContext): Promise<{ data: Record<string, unknown>[] }> {
    const body = (ctx.body ?? {}) as { model?: string; ids?: (number | string)[]; fields?: string[] };
    const modelEntry = findModel(body.model ?? "");
    if (!modelEntry) throw new Error(`Model not found: ${body.model}`);
    const ids = (body.ids ?? []).filter(Boolean);
    if (ids.length === 0) return { data: [] };
    const fields = body.fields ?? ["id"];
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const rows = await m.where({ id: ["in", ids] } as unknown as Record<string, unknown>).field(fields.join(",")).select() as Record<string, unknown>[];
    return { data: rows };
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

  async function entityDetailAction(ctx: ThinkContext, modelName: string, id: string): Promise<{ data: Record<string, unknown> | null }> {
    const url = new URL(ctx.request.url);
    const fieldsParam = url.searchParams.get("fields");
    const modelEntry = findModel(modelName);
    if (!modelEntry) throw new Error(`Model not found: ${modelName}`);
    const pk = modelEntry.dsl.primaryKey ?? "id";
    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const record = (await m.where({ [pk]: id }).find()) as Record<string, unknown> | null;
    if (!record) return { data: null };
    if (fieldsParam) {
      const fields = fieldsParam.split(",").map((f) => f.trim()).filter(Boolean);
      const filtered: Record<string, unknown> = {};
      for (const f of fields) {
        if (f in record) filtered[f] = record[f];
      }
      return { data: filtered };
    }
    return { data: record };
  }

  async function exportCsvAction(ctx: ThinkContext, model: string): Promise<{ csv: string; filename: string }> {
    const modelEntry = findModel(model);
    if (!modelEntry) throw new Error(`Model not found: ${model}`);
    const tableEntry = findTable(model);
    const columns = tableEntry?.table.list?.columns ?? modelEntry.dsl.columns.map((c) => ({ field: c.name, title: c.label ?? c.name }));

    const url = new URL(ctx.request.url);
    const where: Record<string, unknown> = {};
    if (tableEntry?.table.search?.fields) {
      for (const sf of tableEntry.table.search.fields) {
        const val = url.searchParams.get(sf.field);
        if (val) where[sf.field] = val;
      }
    }

    const m = ctx.think.model(modelEntry.name, { _aclCtx: ctx });
    const rows = await m.where(where).select() as Record<string, unknown>[];

    const header = columns.map((c) => {
      const col = modelEntry.dsl.columns.find((dc) => dc.name === c.field);
      return col?.label ?? c.field;
    });
    const csvRows = [header.join(",")];
    for (const row of rows) {
      csvRows.push(columns.map((c) => {
        const val = row[c.field];
        if (val == null) return "";
        const s = String(val).replace(/"/g, '""');
        return s.includes(",") || s.includes('"') ? `"${s}"` : s;
      }).join(","));
    }
    return { csv: csvRows.join("\n"), filename: `${model}.csv` };
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
    batchLookupAction,
    entityDetailAction,
    entityListAction,
    exportCsvAction,
  };
}

// ── Module-level exports for external callers ──

export async function batchLookup(
  ctx: ThinkContext,
  lookups: Array<{ model: string; ids: (string | number)[]; field: string }>,
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};
  for (const entry of lookups) {
    const m = ctx.think.model(entry.model, { _aclCtx: ctx });
    const rows = (await m.where({ id: ["in", entry.ids] } as unknown as Record<string, unknown>).select()) as Record<string, unknown>[];
    const map: Record<string, string> = {};
    for (const row of rows) {
      map[String(row.id)] = String(row[entry.field] ?? row.id);
    }
    result[entry.model] = map;
  }
  return result;
}

export async function entityDetail(
  ctx: ThinkContext,
  modelName: string,
  id: string,
  fields?: string[],
): Promise<Record<string, unknown> | null> {
  const m = ctx.think.model(modelName, { _aclCtx: ctx });
  const record = (await m.where({ id }).find()) as Record<string, unknown> | null;
  if (!record) return null;
  if (fields && fields.length > 0) {
    const filtered: Record<string, unknown> = {};
    for (const f of fields) {
      if (f in record) filtered[f] = record[f];
    }
    return filtered;
  }
  return record;
}

export async function entityList(
  ctx: ThinkContext,
  modelName: string,
  ids: (string | number)[],
  fields?: string[],
): Promise<Record<string, unknown>[]> {
  const m = ctx.think.model(modelName, { _aclCtx: ctx });
  const rows = (await m.where({ id: ["in", ids] } as unknown as Record<string, unknown>).select()) as Record<string, unknown>[];
  if (!fields || fields.length === 0) return rows;
  return rows.map((r) => {
    const filtered: Record<string, unknown> = {};
    for (const f of fields) {
      if (f in r) filtered[f] = r[f];
    }
    return filtered;
  });
}
