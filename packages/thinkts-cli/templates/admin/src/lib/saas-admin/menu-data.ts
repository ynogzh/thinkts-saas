import type { MenuGroupConfig, MenuItemConfig } from "./menu-catalog";

/**
 * Modern, business-scenario-first navigation catalog.
 *
 * Rules:
 * - Top-level groups are business domains, not module dumps.
 * - 3-level nesting: group -> section -> leaf.
 * - Workflows that represent daily operations live under "快捷工作台".
 * - Resource-only pages are grouped by object lifecycle.
 */
export const MENU_CATALOG: MenuGroupConfig[] = [
  {
    code: "overview",
    label: "仪表盘",
    icon: "LayoutDashboard",
    order: 10,
    children: [
      { type: "workflow", label: "管理概览", href: "/saas/overview", order: 10 },
      { type: "workflow", label: "租户开通", href: "/saas/workflows/bootstrap", order: 20 },
    ],
  },
  {
    code: "device_business",
    label: "设备经营",
    icon: "Cpu",
    order: 20,
    requiredModules: ["iotbiz"],
    children: [
      {
        type: "group",
        label: "主体管理",
        order: 10,
        children: [
          { type: "resource", label: "代理商", resourcePath: "promote/agent" },
          { type: "resource", label: "商家管理", resourcePath: "iotbiz/merchant" },
          { type: "resource", label: "设备点位", resourcePath: "iotbiz/site" },
        ],
      },
      {
        type: "group",
        label: "设备资产",
        order: 20,
        children: [
          { type: "resource", label: "设备品类", resourcePath: "iotbiz/device/category" },
          { type: "resource", label: "设备机型", resourcePath: "iotbiz/device/profile" },
          { type: "resource", label: "设备类型", resourcePath: "iotbiz/device/type" },
          { type: "resource", label: "设备管理", resourcePath: "iotbiz/device" },
          { type: "resource", label: "设备SKU", resourcePath: "iotbiz/device/sku" },
        ],
      },
      {
        type: "group",
        label: "运行监控",
        order: 30,
        children: [
          { type: "resource", label: "参数模板", resourcePath: "iotbiz/param/template" },
          { type: "resource", label: "命令日志", resourcePath: "iotbiz/command/log" },
          { type: "resource", label: "设备会话", resourcePath: "iotbiz/session" },
          { type: "resource", label: "使用记录", resourcePath: "iotbiz/device/usage/record" },
        ],
      },
      {
        type: "group",
        label: "快捷工作台",
        order: 40,
        children: [
          { type: "workflow", label: "设备故障台", href: "/saas/workflows/device-faults" },
          { type: "workflow", label: "代理商家入驻", href: "/saas/workflows/merchant-onboarding" },
          { type: "workflow", label: "代理商家工作台", href: "/saas/workflows/merchant-agent" },
        ],
      },
    ],
  },
  {
    code: "commerce",
    label: "会员与套餐",
    icon: "Gift",
    order: 30,
    requiredModules: ["iotbiz"],
    children: [
      { type: "resource", label: "设备套餐", resourcePath: "iotbiz/package", order: 10 },
      { type: "resource", label: "会员权益", resourcePath: "iotbiz/entitlement", order: 20 },
      { type: "resource", label: "充值订单", resourcePath: "iotbiz/recharge/order", order: 30 },
      { type: "resource", label: "套餐订单", resourcePath: "iotbiz/package/order", order: 40 },
    ],
  },
  {
    code: "finance",
    label: "交易财务",
    icon: "ReceiptText",
    order: 40,
    requiredModules: ["trade", "payment", "iotbiz"],
    children: [
      {
        type: "group",
        label: "交易流水",
        order: 10,
        children: [
          { type: "resource", label: "交易订单", resourcePath: "trade/order" },
          { type: "resource", label: "交易明细", resourcePath: "trade/order/item" },
          { type: "resource", label: "支付单", resourcePath: "payment/order" },
          { type: "resource", label: "退款单", resourcePath: "payment/refund" },
          { type: "resource", label: "回调日志", resourcePath: "payment/callback/log" },
        ],
      },
      {
        type: "group",
        label: "结算分账",
        order: 20,
        children: [
          { type: "resource", label: "收益分账", resourcePath: "iotbiz/revenue/share" },
          { type: "resource", label: "结算单", resourcePath: "trade/settle/order" },
          { type: "workflow", label: "分账结算台", href: "/saas/workflows/settlement-ops" },
        ],
      },
      {
        type: "group",
        label: "账户资产",
        order: 30,
        requiredModules: ["account"],
        children: [
          { type: "resource", label: "资产账户", resourcePath: "account/asset" },
          { type: "resource", label: "资产流水", resourcePath: "account/asset/record" },
          { type: "resource", label: "冻结记录", resourcePath: "account/freeze/record" },
        ],
      },
    ],
  },
  {
    code: "marketing",
    label: "营销增长",
    icon: "Megaphone",
    order: 50,
    requiredModules: ["operation", "promote", "channel", "iotbiz"],
    children: [
      {
        type: "group",
        label: "营销活动",
        order: 10,
        children: [
          { type: "resource", label: "营销活动", resourcePath: "iotbiz/campaign" },
          { type: "resource", label: "优惠券模板", resourcePath: "promote/coupon/template" },
          { type: "resource", label: "优惠券范围", resourcePath: "promote/coupon/scope" },
          { type: "resource", label: "用户优惠券", resourcePath: "promote/user/coupon" },
          { type: "resource", label: "优惠券核销", resourcePath: "promote/coupon/use/record" },
        ],
      },
      {
        type: "group",
        label: "渠道代理",
        order: 20,
        children: [
          { type: "resource", label: "代理等级", resourcePath: "promote/agent/level" },
          { type: "resource", label: "代理关系", resourcePath: "promote/agent/relation" },
          { type: "resource", label: "佣金规则", resourcePath: "promote/commission/rule" },
          { type: "resource", label: "佣金记录", resourcePath: "promote/commission/record" },
          { type: "resource", label: "渠道", resourcePath: "channel/channel" },
          { type: "resource", label: "来源记录", resourcePath: "channel/source/record" },
          { type: "resource", label: "邀请码", resourcePath: "channel/invite/code" },
        ],
      },
      {
        type: "group",
        label: "内容运营",
        order: 30,
        children: [
          { type: "resource", label: "广告位", resourcePath: "operation/ad" },
          { type: "resource", label: "广告位置", resourcePath: "operation/ad/position" },
          { type: "resource", label: "标签", resourcePath: "operation/tag" },
          { type: "resource", label: "标签关系", resourcePath: "operation/tag/relation" },
          { type: "resource", label: "工单", resourcePath: "operation/ticket" },
        ],
      },
    ],
  },
  {
    code: "mall",
    label: "商城",
    icon: "ShoppingCart",
    order: 60,
    requiredModules: ["mall"],
    children: [
      { type: "resource", label: "商品", resourcePath: "mall/product", order: 10 },
      { type: "resource", label: "商城订单", resourcePath: "mall/order", order: 20 },
      { type: "resource", label: "订单明细", resourcePath: "mall/order/item", order: 30 },
      { type: "workflow", label: "商城闭环演练", href: "/saas/workflows/commerce", order: 40 },
    ],
  },
  {
    code: "users",
    label: "用户权限",
    icon: "Users",
    order: 70,
    requiredModules: ["identity", "permission"],
    children: [
      {
        type: "group",
        label: "身份",
        order: 10,
        children: [
          { type: "resource", label: "用户", resourcePath: "identity/user" },
          { type: "resource", label: "部门", resourcePath: "identity/dept" },
        ],
      },
      {
        type: "group",
        label: "权限",
        order: 20,
        children: [
          { type: "resource", label: "角色", resourcePath: "permission/role" },
          { type: "resource", label: "权限点", resourcePath: "permission/permission" },
          { type: "resource", label: "菜单", resourcePath: "permission/menu" },
          { type: "resource", label: "用户角色", resourcePath: "permission/user/role" },
          { type: "resource", label: "角色权限", resourcePath: "permission/role/permission" },
          { type: "resource", label: "数据资源", resourcePath: "permission/data/resource" },
          { type: "resource", label: "数据范围", resourcePath: "permission/data/scope" },
        ],
      },
      {
        type: "group",
        label: "快捷工作台",
        order: 30,
        children: [
          { type: "workflow", label: "权限控制台", href: "/saas/workflows/permission-console" },
        ],
      },
    ],
  },
  {
    code: "system",
    label: "系统平台",
    icon: "Settings2",
    order: 80,
    requiredModules: ["platform", "config", "dashboard", "event"],
    children: [
      {
        type: "group",
        label: "平台",
        order: 10,
        children: [
          { type: "resource", label: "租户", resourcePath: "platform/tenant" },
          { type: "resource", label: "套餐", resourcePath: "platform/package" },
          { type: "resource", label: "模块目录", resourcePath: "platform/module" },
          { type: "resource", label: "租户模块", resourcePath: "platform/tenant/module" },
        ],
      },
      {
        type: "group",
        label: "配置",
        order: 20,
        children: [
          { type: "resource", label: "配置项", resourcePath: "config/setting" },
          { type: "resource", label: "字典", resourcePath: "config/dict" },
          { type: "resource", label: "字典项", resourcePath: "config/dict/item" },
          { type: "resource", label: "文件", resourcePath: "config/file" },
          { type: "resource", label: "操作日志", resourcePath: "config/operation/log" },
          { type: "resource", label: "审计日志", resourcePath: "config/audit/log" },
        ],
      },
      {
        type: "group",
        label: "事件",
        order: 30,
        children: [
          { type: "resource", label: "事件记录", resourcePath: "event/record" },
          { type: "resource", label: "Webhook 配置", resourcePath: "event/webhook/config" },
          { type: "resource", label: "Webhook 日志", resourcePath: "event/webhook/log" },
          { type: "workflow", label: "事件运维台", href: "/saas/workflows/event-ops" },
        ],
      },
      {
        type: "group",
        label: "看板",
        order: 40,
        children: [
          { type: "resource", label: "看板", resourcePath: "dashboard/dashboard" },
          { type: "resource", label: "组件", resourcePath: "dashboard/widget" },
          { type: "resource", label: "数据源", resourcePath: "dashboard/data/source" },
        ],
      },
      {
        type: "group",
        label: "内容",
        order: 50,
        requiredModules: ["content"],
        children: [
          { type: "resource", label: "内容分类", resourcePath: "content/category" },
          { type: "resource", label: "文章", resourcePath: "content/article" },
        ],
      },
    ],
  },
];
