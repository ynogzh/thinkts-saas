import {
  Activity,
  Award,
  Banknote,
  BarChart3,
  Bell,
  Blocks,
  BookText,
  Boxes,
  Briefcase,
  Building2,
  ClipboardList,
  Cpu,
  CreditCard,
  Database,
  FileClock,
  FileCode,
  FileText,
  Gauge,
  Gift,
  Globe,
  IdCard,
  LayoutDashboard,
  Link2,
  List,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Monitor,
  Package2,
  PackageCheck,
  Percent,
  PieChart,
  Receipt,
  ReceiptText,
  RotateCcw,
  ScanLine,
  Settings2,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  Tags,
  Ticket,
  User,
  UserCog,
  Users,
  Wallet,
  Webhook,
} from "lucide-react";

import type { ModulePageConfig, ResourceOptionSource,ResourcePageConfig } from "./types";

function resource(moduleCode: string, path: string, title: string, description: string, icon: ResourcePageConfig["icon"], options: Partial<ResourcePageConfig> = {}): ResourcePageConfig {
  return {
    code: path,
    label: title,
    model: path.replace(/\//g, "_"),
    moduleCode,
    path,
    title,
    description,
    icon,
    ...options,
  };
}

export function _source(resource: string, labelField: string, valueField = "id"): ResourceOptionSource {
  return { resource, labelField, valueField };
}
export const RESOURCES: ResourcePageConfig[] = [
  // 平台租户
  resource("platform", "platform/tenant", "租户", "多租户管理", Building2, {
    defaultValues: { status: "enabled" },
    actionLinks: [{ label: "开通租户", href: "/saas/workflows/bootstrap", variant: "default" }],
  }),
  resource("platform", "platform/package", "套餐", "租户套餐模板", Package2, { defaultValues: { status: "enabled" } }),
  resource("platform", "platform/module", "模块目录", "可订阅模块配置", Blocks, { defaultValues: { status: "enabled" } }),
  resource("platform", "platform/tenant/module", "租户模块", "租户已开通模块", IdCard, { defaultValues: { status: "enabled" } }),

  // 身份
  resource("identity", "identity/user", "用户", "平台账号", User, {
    defaultValues: { status: "enabled", user_type: "admin" },
    actionLinks: [{ label: "权限控制台", href: "/saas/workflows/permission-console", variant: "outline" }],
  }),
  resource("identity", "identity/dept", "部门", "组织架构", Building2, { defaultValues: { status: "enabled" } }),
  resource("identity", "identity/login/log", "登录日志", "用户登录记录", FileClock, { readOnly: true }),

  // 权限
  resource("permission", "permission/role", "角色", "角色定义", Shield, { defaultValues: { status: "enabled" } }),
  resource("permission", "permission/permission", "权限点", "资源操作权限", Lock),
  resource("permission", "permission/menu", "菜单", "后台菜单管理", List),
  resource("permission", "permission/user/role", "用户角色", "用户角色绑定", UserCog),
  resource("permission", "permission/role/permission", "角色权限", "角色权限绑定", ShieldCheck),
  resource("permission", "permission/data/resource", "数据资源", "数据权限资源", Database),
  resource("permission", "permission/data/scope", "数据范围", "角色数据范围", ScanLine),

  // 配置
  resource("config", "config/setting", "系统设置", "全局配置项", Settings2),
  resource("config", "config/dict", "字典", "枚举字典", BookText),
  resource("config", "config/dict/item", "字典项", "字典条目", List),
  resource("config", "config/file", "文件", "文件元数据", FileText),
  resource("config", "config/operation/log", "操作日志", "用户操作记录", ClipboardList, { readOnly: true }),
  resource("config", "config/audit/log", "审计日志", "合规审计记录", FileClock, { readOnly: true }),

  // 事件
  resource("event", "event/record", "事件记录", "业务事件", Bell),
  resource("event", "event/webhook/config", "Webhook 配置", "Webhook 订阅配置", Webhook),
  resource("event", "event/webhook/log", "Webhook 日志", "Webhook 调用记录", FileClock, { readOnly: true }),

  // 看板
  resource("dashboard", "dashboard/dashboard", "看板", "Dashboard 定义", LayoutDashboard),
  resource("dashboard", "dashboard/widget", "组件", "看板组件", Blocks),
  resource("dashboard", "dashboard/data/source", "数据源", "看板数据源", Database),

  // 内容
  resource("content", "content/category", "内容分类", "内容类目", Tags, { defaultValues: { status: "enabled" } }),
  resource("content", "content/article", "文章", "内容文章", BookText, { defaultValues: { status: "enabled" } }),

  // 交易
  resource("trade", "trade/order", "交易订单", "订单主表", Receipt, { defaultValues: { status: "pending" } }),
  resource("trade", "trade/order/item", "交易明细", "订单明细", List),
  resource("trade", "trade/settle/order", "结算单", "结算订单", Banknote),

  // 支付
  resource("payment", "payment/order", "支付单", "支付记录", CreditCard),
  resource("payment", "payment/refund", "退款单", "退款记录", RotateCcw),
  resource("payment", "payment/callback/log", "回调日志", "支付回调记录", Webhook, { readOnly: true }),

  // 账户
  resource("account", "account/asset", "资产账户", "用户资产账户", Wallet),
  resource("account", "account/asset/record", "资产流水", "账户流水记录", ReceiptText),
  resource("account", "account/freeze/record", "冻结记录", "资产冻结记录", Lock),

  // 营销
  resource("promote", "promote/agent", "代理", "代理商管理", Briefcase, { defaultValues: { status: "enabled" } }),
  resource("promote", "promote/agent/level", "代理等级", "代理等级配置", Award),
  resource("promote", "promote/agent/relation", "代理关系", "代理层级关系", Link2),
  resource("promote", "promote/commission/rule", "佣金规则", "佣金比例规则", FileText),
  resource("promote", "promote/commission/record", "佣金记录", "佣金结算记录", ClipboardList),
  resource("promote", "promote/coupon/template", "优惠券模板", "优惠券模板", Ticket),
  resource("promote", "promote/coupon/scope", "优惠券范围", "可用范围配置", Percent),
  resource("promote", "promote/user/coupon", "用户优惠券", "用户领取的优惠券", Ticket),
  resource("promote", "promote/coupon/use/record", "优惠券核销", "优惠券使用记录", ScanLine),

  // 渠道
  resource("channel", "channel/channel", "渠道", "推广渠道", Globe),
  resource("channel", "channel/source/record", "来源记录", "渠道来源记录", Link2),
  resource("channel", "channel/invite/code", "邀请码", "邀请码管理", Mail),

  // 运营
  resource("operation", "operation/ad", "广告", "广告管理", Megaphone),
  resource("operation", "operation/ad/position", "广告位", "广告位置管理", MapPin),
  resource("operation", "operation/tag", "标签", "标签管理", Tag),
  resource("operation", "operation/tag/relation", "标签关系", "标签绑定关系", Tags),
  resource("operation", "operation/ticket", "工单", "运营工单", Ticket),

  // 商城
  resource("mall", "mall/product", "商品", "商城商品", ShoppingBag, { defaultValues: { status: "enabled" } }),
  resource("mall", "mall/order", "商城订单", "商城订单", ShoppingCart),
  resource("mall", "mall/order/item", "订单明细", "商城订单明细", List),

  // 共享设备
  resource("iotbiz", "iotbiz/merchant", "商家", "共享设备商家", Store, { defaultValues: { status: "enabled" } }),
  resource("iotbiz", "iotbiz/site", "设备点位", "商家下的设备点位", MapPin, { defaultValues: { status: "enabled" } }),
  resource("iotbiz", "iotbiz/device/category", "设备品类", "设备品类", Boxes),
  resource("iotbiz", "iotbiz/device/profile", "设备机型", "设备机型/Profile", Smartphone),
  resource("iotbiz", "iotbiz/device/type", "设备类型", "设备类型管理", Monitor),
  resource("iotbiz", "iotbiz/device", "设备管理", "设备实例", Cpu, { defaultValues: { status: "enabled", online_status: "offline" } }),
  resource("iotbiz", "iotbiz/device/sku", "设备SKU", "设备 SKU", PackageCheck),
  resource("iotbiz", "iotbiz/param/template", "参数模板", "设备参数模板", FileCode),
  resource("iotbiz", "iotbiz/command/log", "命令日志", "设备命令记录", ClipboardList),
  resource("iotbiz", "iotbiz/session", "设备会话", "设备使用会话", Activity),
  resource("iotbiz", "iotbiz/device/usage/record", "使用记录", "设备使用记录", Gauge),
  resource("iotbiz", "iotbiz/package", "设备套餐", "会员/设备套餐", Gift, { defaultValues: { status: "enabled" } }),
  resource("iotbiz", "iotbiz/entitlement", "会员权益", "用户套餐权益", Award),
  resource("iotbiz", "iotbiz/recharge/order", "充值订单", "会员充值订单", CreditCard),
  resource("iotbiz", "iotbiz/package/order", "套餐订单", "设备套餐订单", Package2),
  resource("iotbiz", "iotbiz/revenue/share", "收益分账", "收益分账记录", PieChart),
  resource("iotbiz", "iotbiz/campaign", "营销活动", "营销活动", Sparkles),
];
