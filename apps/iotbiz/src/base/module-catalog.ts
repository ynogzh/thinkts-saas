export interface ModuleCatalogEntry {
  code: string;
  label: string;
  type: "core" | "support" | "business";
  description: string;
  models: string[];
  dependencies?: string[];
  enabledByDefault?: boolean;
}

export interface PackageCatalogEntry {
  code: string;
  label: string;
  price: number;
  userLimit?: number;
  storageLimit?: number;
  moduleCodes: string[];
  limitJson?: Record<string, unknown>;
  status?: "enabled" | "disabled";
  defaultForBootstrap?: boolean;
}

export const MODULE_CATALOG: ModuleCatalogEntry[] = [
  { code: "platform", label: "平台", type: "core", description: "租户、模块、套餐与模块授权。", models: ["platform_tenant", "platform_module", "platform_package", "platform_tenant_module"], enabledByDefault: true },
  { code: "identity", label: "身份", type: "core", description: "用户、部门、登录日志。", models: ["identity_user", "identity_dept", "identity_login_log"], enabledByDefault: true },
  { code: "permission", label: "权限", type: "core", description: "角色、权限、菜单、用户角色与数据范围。", models: ["permission_role", "permission_permission", "permission_menu", "permission_user_role", "permission_role_permission", "permission_data_resource", "permission_data_scope"], dependencies: ["identity"], enabledByDefault: true },
  { code: "config", label: "配置", type: "support", description: "系统设置、字典、文件、操作与审计日志。", models: ["config_setting", "config_dict", "config_dict_item", "config_file", "config_operation_log", "config_audit_log"], enabledByDefault: true },
  { code: "account", label: "账户", type: "business", description: "资产账户、冻结与流水。", models: ["account_asset", "account_asset_record", "account_freeze_record"], dependencies: ["identity"], enabledByDefault: true },
  { code: "trade", label: "交易", type: "business", description: "业务订单、订单明细、结算订单。", models: ["trade_order", "trade_order_item", "trade_settle_order"], dependencies: ["identity", "account"], enabledByDefault: true },
  { code: "payment", label: "支付", type: "business", description: "支付渠道、支付单、退款单与回调日志。", models: ["payment_channel", "payment_order", "payment_refund", "payment_callback_log"], dependencies: ["trade"], enabledByDefault: true },
  { code: "channel", label: "渠道", type: "support", description: "渠道、来源与邀请码。", models: ["channel_channel", "channel_source_record", "channel_invite_code"], enabledByDefault: true },
  { code: "promote", label: "推广", type: "business", description: "代理等级、关系、佣金规则、优惠券与用户券。", models: ["promote_agent", "promote_agent_level", "promote_agent_relation", "promote_commission_rule", "promote_commission_record", "promote_coupon_template", "promote_coupon_scope", "promote_user_coupon", "promote_coupon_use_record"], dependencies: ["identity", "channel", "trade", "payment"], enabledByDefault: true },
  { code: "iotbiz", label: "物联网生意", type: "business", description: "共享/物联网设备支付平台。", models: ["iotbiz_merchant", "iotbiz_device_type", "iotbiz_device_category", "iotbiz_device_profile", "iotbiz_device", "iotbiz_site", "iotbiz_param_template", "iotbiz_command_log", "iotbiz_session", "iotbiz_package", "iotbiz_entitlement", "iotbiz_recharge_order", "iotbiz_package_order", "iotbiz_revenue_share", "iotbiz_campaign", "iotbiz_device_sku", "iotbiz_device_usage_record"], dependencies: ["identity", "account", "trade", "payment", "promote", "channel", "event", "dashboard"], enabledByDefault: true },
  { code: "content", label: "内容", type: "support", description: "内容分类与文章。", models: ["content_category", "content_article"], enabledByDefault: true },
  { code: "dashboard", label: "看板", type: "support", description: "看板、组件与数据源。", models: ["dashboard_dashboard", "dashboard_widget", "dashboard_data_source"], dependencies: ["config"], enabledByDefault: true },
  { code: "event", label: "事件", type: "support", description: "统一事件记录与 webhook。", models: ["event_record", "event_webhook_config", "event_webhook_log"], enabledByDefault: true },
  { code: "mall", label: "商城", type: "business", description: "商品、商城订单与订单明细。", models: ["mall_product", "mall_order", "mall_order_item"], dependencies: ["identity", "trade", "payment", "promote", "channel"], enabledByDefault: true },
];

export const PACKAGE_CATALOG: PackageCatalogEntry[] = [
  {
    code: "starter", label: "Starter", price: 0, userLimit: 20,
    moduleCodes: ["platform", "identity", "permission", "config", "channel", "content", "trade", "payment", "event", "dashboard", "mall", "iotbiz"],
    defaultForBootstrap: true,
  },
  {
    code: "growth", label: "Growth", price: 1999, userLimit: 200,
    moduleCodes: ["platform", "identity", "permission", "config", "account", "trade", "payment", "channel", "promote", "content", "dashboard", "event", "mall", "iotbiz"],
  },
  {
    code: "enterprise", label: "Enterprise", price: 9999, userLimit: 1000,
    moduleCodes: MODULE_CATALOG.map((entry) => entry.code),
  },
];

const MODULE_INDEX = new Map(MODULE_CATALOG.map((entry) => [entry.code, entry]));

function toLabel(str: string): string {
  return str.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function modelNameToPath(name: string): string {
  return `/${name.split("_").join("/")}`;
}

export function resolveModuleCode(name: string): string | undefined {
  if (!name) return undefined;
  const slashCode = name.split("/")[0] ?? "";
  if (MODULE_INDEX.has(slashCode)) return slashCode;
  const underscoreCode = name.split("_")[0] ?? "";
  if (MODULE_INDEX.has(underscoreCode)) return underscoreCode;
  return undefined;
}

export function expandModuleCodes(moduleCodes: string[]): string[] {
  const resolved = new Set<string>();
  const visit = (code: string) => {
    if (resolved.has(code)) return;
    const entry = MODULE_INDEX.get(code);
    if (!entry) return;
    for (const dependency of entry.dependencies ?? []) visit(dependency);
    resolved.add(code);
  };
  for (const code of moduleCodes) visit(code);
  return MODULE_CATALOG.map((entry) => entry.code).filter((code) => resolved.has(code));
}

export function getBootstrapPackage(code?: string): PackageCatalogEntry {
  if (code) {
    const match = PACKAGE_CATALOG.find((entry) => entry.code === code);
    if (match) return match;
  }
  return PACKAGE_CATALOG.find((entry) => entry.defaultForBootstrap) ?? PACKAGE_CATALOG[0]!;
}

export function buildModuleMenuGroups() {
  return MODULE_CATALOG.map((entry) => ({
    group: entry.code,
    label: entry.label,
    type: entry.type,
    description: entry.description,
    dependencies: entry.dependencies ?? [],
    models: entry.models.map((name) => ({
      name,
      label: toLabel(name),
      path: `${modelNameToPath(name)}/list`,
    })),
  }));
}

export function buildPermissionMenuSeeds() {
  return MODULE_CATALOG.map((entry, moduleIndex) => ({
    moduleCode: entry.code,
    name: entry.label,
    path: `${modelNameToPath(entry.models[0] ?? entry.code)}/list`,
    sort: moduleIndex * 100,
    items: entry.models.map((name, modelIndex) => ({
      name,
      label: toLabel(name),
      path: `${modelNameToPath(name)}/list`,
      permissionCode: `${name}:list`,
      sort: modelIndex * 100 + modelIndex + 1,
    })),
  }));
}

export function listEnabledModuleCodes(): string[] {
  return expandModuleCodes(MODULE_CATALOG.filter((entry) => entry.enabledByDefault !== false).map((entry) => entry.code));
}
