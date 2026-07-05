import { saasModules } from "../catalog";
import type { AdminSession, DoughnutPoint, OverviewStat, RecentActivityItem, TrendPoint } from "../types";
import { fetchSharedDeviceOverview, ensureSharedDeviceDashboard } from "./iotbiz";
import { fetchTenantModules } from "./auth";
import { listResource } from "./resource";

export async function fetchOverviewData(session: AdminSession): Promise<{
  stats: OverviewStat[];
  trend: TrendPoint[];
  moduleMix: DoughnutPoint[];
  recent: RecentActivityItem[];
  sharedDevice: null | {
    devicesTotal: number;
    devicesOnline: number;
    sessionsCompleted: number;
    sessionsRefunded: number;
    totalRevenue: number;
    pendingShare: number;
  };
}> {
  const overviewResources = [
    "platform/tenant",
    "identity/user",
    "permission/role",
    "mall/product",
    "mall/order",
    "payment/order",
    "event/record",
  ] as const;

  const emptyList = { data: { count: 0, data: [] as Record<string, unknown>[] } };
  const [sharedDeviceDashboard, sharedDeviceOverview, tenantModules, ...responses] =
    await Promise.all([
      ensureSharedDeviceDashboard(session).catch(() => null),
      fetchSharedDeviceOverview(session).catch(() => null),
      fetchTenantModules(session).catch(() => [] as string[]),
      ...overviewResources.map((path) => listResource(path, session).catch(() => emptyList)),
    ]);
  const counts = Object.fromEntries(
    overviewResources.map((path, index) => [
      path,
      Number(responses[index]?.data?.count ?? 0),
    ]),
  ) as Record<(typeof overviewResources)[number], number>;

  const enabledModuleCodes = new Set(
    tenantModules.length ? tenantModules : saasModules.map((m) => m.code),
  );
  const stats: OverviewStat[] = [
    {
      label: "租户",
      value: counts["platform/tenant"] ?? 0,
      icon: "Building2",
      previousValue: `${counts["platform/tenant"] ?? 0} previous month`,
    },
    {
      label: "用户",
      value: counts["identity/user"] ?? 0,
      icon: "Users",
      previousValue: `${counts["identity/user"] ?? 0} previous month`,
    },
    {
      label: "角色",
      value: counts["permission/role"] ?? 0,
      icon: "Users",
      previousValue: `${counts["permission/role"] ?? 0} previous month`,
    },
    {
      label: "商品",
      value: counts["mall/product"] ?? 0,
      icon: "Gift",
      previousValue: `${counts["mall/product"] ?? 0} previous month`,
    },
    {
      label: "商城订单",
      value: counts["mall/order"] ?? 0,
      icon: "ShoppingBag",
      previousValue: `${counts["mall/order"] ?? 0} previous month`,
    },
    {
      label: "支付单",
      value: counts["payment/order"] ?? 0,
      icon: "CreditCard",
      previousValue: `${counts["payment/order"] ?? 0} previous month`,
    },
  ];

  const trend: TrendPoint[] = saasModules
    .filter((moduleItem) => enabledModuleCodes.has(moduleItem.code))
    .map((moduleItem) => ({
      label: moduleItem.label,
      count: moduleItem.resources.length,
    }));

  const moduleMix: DoughnutPoint[] = saasModules
    .filter((moduleItem) => enabledModuleCodes.has(moduleItem.code))
    .map((moduleItem, index) => ({
      label: moduleItem.label,
      value: moduleItem.resources.length,
      fill: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"][
        index % 5
      ],
    }));

  const recentOrders = responses[4]?.data?.data ?? [];
  const recentPayments = responses[5]?.data?.data ?? [];
  const recentEvents = responses[6]?.data?.data ?? [];
  const dashboardData = sharedDeviceDashboard?.data as
    | { dashboard?: Record<string, unknown> }
    | undefined;
  const recent: RecentActivityItem[] = [
    ...(dashboardData?.dashboard
      ? [
          {
            title: `看板 ${String(dashboardData.dashboard.name ?? "共享设备运营看板")}`,
            subtitle: "已注册共享设备 dashboard widgets",
            href: "/saas/resources/dashboard/widget",
            meta: String(dashboardData.dashboard.code ?? "shared_device_ops"),
          },
        ]
      : []),
    ...recentOrders.slice(0, 3).map((row: Record<string, unknown>) => ({
      title: `商城订单 ${String(row.order_no ?? row.id ?? "")}`,
      subtitle: `状态 ${String(row.status ?? "unknown")}`,
      href: "/saas/resources/mall/order",
      meta: `金额 ${String(row.amount ?? 0)}`,
    })),
    ...recentPayments.slice(0, 2).map((row: Record<string, unknown>) => ({
      title: `支付单 ${String(row.pay_no ?? row.id ?? "")}`,
      subtitle: `状态 ${String(row.status ?? "unknown")}`,
      href: "/saas/resources/payment/order",
      meta: `渠道 ${String(row.channel_code ?? "-")}`,
    })),
    ...recentEvents.slice(0, 2).map((row: Record<string, unknown>) => ({
      title: `事件 ${String(row.event_code ?? row.id ?? "")}`,
      subtitle: `模块 ${String(row.module_code ?? "unknown")}`,
      href: "/saas/resources/event/record",
      meta: `状态 ${String(row.status ?? "unknown")}`,
    })),
  ].slice(0, 6);

  const sharedDeviceData = sharedDeviceOverview?.data as
    | Record<string, Record<string, unknown>>
    | undefined;
  const sharedDevice = sharedDeviceData
    ? {
        devicesTotal: Number(sharedDeviceData.devices?.total ?? 0),
        devicesOnline: Number(sharedDeviceData.devices?.online ?? 0),
        sessionsCompleted: Number(sharedDeviceData.sessions?.completed ?? 0),
        sessionsRefunded: Number(sharedDeviceData.sessions?.refunded ?? 0),
        totalRevenue: Number(sharedDeviceData.finance?.total_revenue ?? 0),
        pendingShare: Number(sharedDeviceData.finance?.pending_share ?? 0),
      }
    : null;

  return { stats, trend, moduleMix, recent, sharedDevice };
}
