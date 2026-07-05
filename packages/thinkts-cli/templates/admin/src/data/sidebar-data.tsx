"use client";

import { Building2 } from "lucide-react";

import type { NavCollapsibleItem, NavGroup, NavLeafItem, SidebarData } from "@/components/layout/types";
import { Logo } from "@/components/logo";
import { ICON_MAP, MENU_CATALOG, type MenuGroupConfig, type MenuItemConfig } from "@/lib/saas-admin/menu-catalog";

function iconByName(name?: string) {
  return name ? ICON_MAP[name] : undefined;
}

const GROUP_ICON_HINTS: Record<string, string> = {
  "主体管理": "Briefcase",
  "设备资产": "Cpu",
  "运行监控": "Activity",
  "交易流水": "Receipt",
  "结算分账": "Banknote",
  "账户资产": "Wallet",
  "营销活动": "Sparkles",
  "渠道代理": "Globe",
  "内容运营": "FileText",
  "身份": "User",
  "权限": "Shield",
  "平台": "Building2",
  "配置": "Settings2",
  "事件": "Bell",
  "看板": "LayoutDashboard",
  "内容": "BookText",
};

const PATH_ICON_HINTS: Record<string, string> = {
  "promote/agent": "Briefcase",
  "iotbiz/merchant": "Store",
  "iotbiz/site": "MapPin",
  "iotbiz/device/category": "Boxes",
  "iotbiz/device/profile": "Smartphone",
  "iotbiz/device/type": "Monitor",
  "iotbiz/device": "Cpu",
  "iotbiz/device/sku": "PackageCheck",
  "iotbiz/param/template": "FileCode",
  "iotbiz/command/log": "ClipboardList",
  "iotbiz/session": "Activity",
  "iotbiz/device/usage/record": "Gauge",
  "iotbiz/package": "Gift",
  "iotbiz/entitlement": "Award",
  "iotbiz/recharge/order": "CreditCard",
  "iotbiz/package/order": "Package2",
  "trade/order": "Receipt",
  "trade/order/item": "List",
  "payment/order": "CreditCard",
  "payment/refund": "RotateCcw",
  "payment/callback/log": "Webhook",
  "iotbiz/revenue/share": "PieChart",
  "trade/settle/order": "Banknote",
  "account/asset": "Wallet",
  "account/asset/record": "ReceiptText",
  "account/freeze/record": "Lock",
  "iotbiz/campaign": "Sparkles",
  "promote/coupon/template": "Ticket",
  "promote/coupon/scope": "Percent",
  "promote/user/coupon": "Ticket",
  "promote/coupon/use/record": "ScanLine",
  "promote/agent/level": "Award",
  "promote/agent/relation": "Link2",
  "promote/commission/rule": "FileText",
  "promote/commission/record": "ClipboardList",
  "channel/channel": "Globe",
  "channel/source/record": "Link2",
  "channel/invite/code": "Mail",
  "operation/ad": "Megaphone",
  "operation/ad/position": "MapPin",
  "operation/tag": "Tag",
  "operation/tag/relation": "Tags",
  "operation/ticket": "Ticket",
  "mall/product": "ShoppingBag",
  "mall/order": "ShoppingCart",
  "mall/order/item": "List",
  "identity/user": "User",
  "identity/dept": "Building2",
  "permission/role": "Shield",
  "permission/permission": "Lock",
  "permission/menu": "List",
  "permission/user/role": "UserCog",
  "permission/role/permission": "ShieldCheck",
  "permission/data/resource": "Database",
  "permission/data/scope": "ScanLine",
  "platform/tenant": "Building2",
  "platform/package": "Package2",
  "platform/module": "Blocks",
  "platform/tenant/module": "IdCard",
  "config/setting": "Settings2",
  "config/dict": "BookText",
  "config/dict/item": "List",
  "config/file": "FileText",
  "config/operation/log": "ClipboardList",
  "config/audit/log": "FileClock",
  "event/record": "Bell",
  "event/webhook/config": "Webhook",
  "event/webhook/log": "FileClock",
  "dashboard/dashboard": "LayoutDashboard",
  "dashboard/widget": "Blocks",
  "dashboard/data/source": "Database",
  "content/category": "Tags",
  "content/article": "BookText",
};

const WORKFLOW_ICON_HINTS: Record<string, string> = {
  "/saas/workflows/bootstrap": "Sparkles",
  "/saas/workflows/commerce": "ShoppingCart",
  "/saas/workflows/shared-device": "Zap",
  "/saas/workflows/shared-device-ops": "Activity",
  "/saas/workflows/device-faults": "AlertTriangle",
  "/saas/workflows/merchant-onboarding": "Anchor",
  "/saas/workflows/merchant-agent": "Briefcase",
  "/saas/workflows/settlement-ops": "Banknote",
  "/saas/workflows/permission-console": "ShieldCheck",
  "/saas/workflows/event-ops": "Bell",
};

/**
 * Menu groups (category labels) do not show icons in the shadcnblocks style.
 * Collapsible parent items and standalone leaf items each show one icon.
 * Sub-items inside collapsibles do not show icons.
 */
function inferIconForItem(item: MenuItemConfig): string | undefined {
  if (item.icon) return item.icon;

  if (item.type === "group") {
    const exact = GROUP_ICON_HINTS[item.label];
    if (exact) return exact;
  }

  if (item.type === "resource" && item.resourcePath) {
    const exact = PATH_ICON_HINTS[item.resourcePath];
    if (exact) return exact;
    const parts = item.resourcePath.split("/");
    for (let i = parts.length; i > 0; i--) {
      const prefix = parts.slice(0, i).join("/");
      if (PATH_ICON_HINTS[prefix]) return PATH_ICON_HINTS[prefix];
    }
  }

  if (item.type === "workflow" && item.href) {
    const exact = WORKFLOW_ICON_HINTS[item.href];
    if (exact) return exact;
  }

  return undefined;
}

function menuItemToNav(item: MenuItemConfig, enabledModules: Set<string>): NavLeafItem | NavCollapsibleItem | null {
  if (item.hidden) return null;
  if (item.requiredModules?.length && !item.requiredModules.every((m) => enabledModules.has(m))) {
    return null;
  }

  if (item.type === "group") {
    if (!item.children) return null;
    const children = item.children
      .map((c) => menuItemToNav(c, enabledModules))
      .filter((child): child is NavLeafItem => child !== null && "url" in child);
    if (children.length === 0) return null;
    return { title: item.label, icon: iconByName(inferIconForItem(item)), items: children };
  }

  const url = item.type === "resource" ? `/saas/resources/${item.resourcePath}` : item.href ?? item.url;
  if (!url) return null;
  return { title: item.label, icon: iconByName(inferIconForItem(item)), url };
}

function menuGroupToNav(group: MenuGroupConfig, enabledModules: Set<string>): NavGroup | null {
  const children = group.children
    .map((item) => menuItemToNav(item, enabledModules))
    .filter((item): item is NavLeafItem | NavCollapsibleItem => item !== null);
  if (children.length === 0) return null;
  return {
    title: group.label,
    items: children,
  };
}

/**
 * Default module set used when tenant modules cannot be resolved.
 * In production this should come from the tenant/package record.
 */
export function getDefaultEnabledModules(): Set<string> {
  const modules = new Set<string>();
  MENU_CATALOG.forEach((group) => {
    if (group.requiredModules) {
      group.requiredModules.forEach((m) => modules.add(m));
    }
    group.children.forEach((item) => {
      if (item.type === "group") {
        item.children?.forEach((c) => {
          if (c.requiredModules) c.requiredModules.forEach((m) => modules.add(m));
        });
      } else if (item.requiredModules) {
        item.requiredModules.forEach((m) => modules.add(m));
      }
    });
  });
  return modules;
}

const enabledModules = getDefaultEnabledModules();

export const sidebarData: SidebarData = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/01.png",
  },
  teams: [
    {
      name: "SaaS Demo",
      logo: ({ className }: { className: string }) => <Logo className={className} />,
      plan: "Reusable Admin",
    },
    {
      name: "Core Platform",
      logo: Building2,
      plan: "Internal",
    },
  ],
  navGroups: MENU_CATALOG.map((group) => menuGroupToNav(group, enabledModules))
    .filter((group): group is NavGroup => group !== null),
};
