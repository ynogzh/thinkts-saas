import {
  BarChart3,
  Bell,
  BookText,
  Building2,
  Cpu,
  CreditCard,
  Globe,
  Megaphone,
  Receipt,
  Settings2,
  Shield,
  ShoppingCart,
  Tag,
  Users,
  Wallet,
} from "lucide-react";

import type { ModulePageConfig } from "./types";

export const saasModules: ModulePageConfig[] = [
  {
    code: "iotbiz",
    label: "共享设备",
    description: "娃娃机、按摩椅、售货机等共享设备 SaaS 业务。",
    icon: Cpu,
    resources: [
      { path: "iotbiz/merchant", title: "商家", description: "商家管理" },
      { path: "iotbiz/device", title: "设备", description: "设备实例与状态" },
      { path: "iotbiz/package", title: "套餐", description: "设备/会员套餐" },
      { path: "iotbiz/session", title: "会话", description: "设备会话记录" },
      { path: "iotbiz/revenue/share", title: "分账", description: "收益分账" },
      { path: "iotbiz/campaign", title: "营销", description: "营销活动" },
    ],
  },
  {
    code: "mall",
    label: "商城",
    description: "通用电商商品与订单。",
    icon: ShoppingCart,
    resources: [
      { path: "mall/product", title: "商品", description: "商城商品" },
      { path: "mall/order", title: "订单", description: "商城订单" },
    ],
  },
  {
    code: "payment",
    label: "支付",
    description: "支付、退款、回调日志。",
    icon: CreditCard,
    resources: [
      { path: "payment/order", title: "支付单", description: "支付记录" },
      { path: "payment/refund", title: "退款单", description: "退款记录" },
    ],
  },
  {
    code: "trade",
    label: "交易",
    description: "交易订单、结算分账。",
    icon: Receipt,
    resources: [
      { path: "trade/order", title: "订单", description: "交易订单" },
      { path: "trade/settle/order", title: "结算", description: "结算单" },
    ],
  },
  {
    code: "promote",
    label: "营销",
    description: "代理、佣金、优惠券。",
    icon: Megaphone,
    resources: [
      { path: "promote/agent", title: "代理", description: "代理商" },
      { path: "promote/coupon/template", title: "优惠券", description: "优惠券模板" },
    ],
  },
  {
    code: "permission",
    label: "权限",
    description: "角色、权限、数据范围。",
    icon: Shield,
    resources: [
      { path: "permission/role", title: "角色", description: "角色定义" },
      { path: "permission/permission", title: "权限点", description: "资源操作" },
      { path: "permission/data/scope", title: "数据范围", description: "角色数据范围" },
    ],
  },
  {
    code: "identity",
    label: "身份",
    description: "用户、部门、登录日志。",
    icon: Users,
    resources: [
      { path: "identity/user", title: "用户", description: "平台账号" },
      { path: "identity/dept", title: "部门", description: "组织架构" },
    ],
  },
  {
    code: "platform",
    label: "平台",
    description: "租户、套餐、模块目录。",
    icon: Building2,
    resources: [
      { path: "platform/tenant", title: "租户", description: "多租户管理" },
      { path: "platform/package", title: "套餐", description: "租户套餐" },
    ],
  },
  {
    code: "config",
    label: "配置",
    description: "系统设置、字典、文件、日志。",
    icon: Settings2,
    resources: [
      { path: "config/setting", title: "设置", description: "全局配置" },
      { path: "config/dict", title: "字典", description: "枚举字典" },
      { path: "config/file", title: "文件", description: "文件元数据" },
    ],
  },
  {
    code: "event",
    label: "事件",
    description: "事件记录与 Webhook。",
    icon: Bell,
    resources: [
      { path: "event/record", title: "事件", description: "业务事件" },
      { path: "event/webhook/config", title: "Webhook", description: "Webhook 配置" },
    ],
  },
  {
    code: "dashboard",
    label: "看板",
    description: "Dashboard 与数据源。",
    icon: BarChart3,
    resources: [
      { path: "dashboard/dashboard", title: "看板", description: "Dashboard 定义" },
      { path: "dashboard/widget", title: "组件", description: "看板组件" },
    ],
  },
  {
    code: "content",
    label: "内容",
    description: "内容分类与文章。",
    icon: BookText,
    resources: [
      { path: "content/category", title: "分类", description: "内容类目" },
      { path: "content/article", title: "文章", description: "内容文章" },
    ],
  },
  {
    code: "channel",
    label: "渠道",
    description: "推广渠道与邀请码。",
    icon: Globe,
    resources: [
      { path: "channel/channel", title: "渠道", description: "推广渠道" },
      { path: "channel/invite/code", title: "邀请码", description: "邀请码管理" },
    ],
  },
  {
    code: "operation",
    label: "运营",
    description: "广告、标签、工单。",
    icon: Tag,
    resources: [
      { path: "operation/ad", title: "广告", description: "广告管理" },
      { path: "operation/tag", title: "标签", description: "标签管理" },
      { path: "operation/ticket", title: "工单", description: "运营工单" },
    ],
  },
  {
    code: "account",
    label: "账户",
    description: "资产账户、流水、冻结。",
    icon: Wallet,
    resources: [
      { path: "account/asset", title: "资产", description: "资产账户" },
      { path: "account/asset/record", title: "流水", description: "资产流水" },
    ],
  },
];
