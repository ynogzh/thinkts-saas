"use client";

import { ArrowRight, Building2, CreditCard, Gift, ShoppingBag, TrendingDown, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, Pie, PieChart, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import type { DoughnutPoint, OverviewStat, RecentActivityItem, TrendPoint } from "@/lib/saas-admin/types";
import { cn } from "@/lib/utils";

interface Dashboard1Props {
  title: string;
  description: string;
  stats: OverviewStat[];
  trend: TrendPoint[];
  moduleMix: DoughnutPoint[];
  recent: RecentActivityItem[];
  actions?: Array<{ label: string; href: string }>;
}

const trendChartConfig = {
  count: {
    label: "记录数",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const mixChartConfig = {
  value: {
    label: "资源数",
  },
} satisfies ChartConfig;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  CreditCard,
  Gift,
  ShoppingBag,
  Users,
};

function StatCard({ stat }: { stat: OverviewStat }) {
  const Icon = stat.icon ? iconMap[stat.icon] : null;
  const positive = stat.tone === "positive" || (stat.change !== undefined && stat.change >= 0);
  const hasChange = typeof stat.change === "number";
  return (
    <div className="flex flex-col gap-1"
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium"
      >
        {Icon ? <Icon className="size-4" /> : null}
        <span>{stat.label}</span>
      </div>
      <div className="text-muted-foreground text-[10px] font-normal sm:text-xs">
        {stat.previousValue ?? "实时快照"}
      </div>
      <div className="text-2xl font-semibold tracking-tight sm:text-3xl"
      >
        {stat.value.toLocaleString()}
      </div>
      {hasChange ? (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs"
        >
          {positive ? (
            <TrendingUp className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <TrendingDown className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
          )}
          <span className={cn("whitespace-nowrap", positive ? "text-emerald-600" : "text-red-600")}
          >
            {positive ? "+" : ""}
            {stat.change?.toFixed(1)}%
          </span>
          <span className="text-muted-foreground whitespace-nowrap">vs last month</span>
        </div>
      ) : null}
    </div>
  );
}

export function Dashboard1({
  title,
  description,
  stats,
  trend,
  moduleMix,
  recent,
  actions = [],
}: Dashboard1Props) {
  return (
    <div className="space-y-6"
    >
      <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-card to-muted/30 p-6 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="space-y-2"
        >
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs"
          >
            SaaS 运营仪表盘
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2"
        >
          {actions.map((action) => (
            <Button key={action.href} asChild variant="outline"
            >
              <Link href={action.href}>
                {action.label}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card grid grid-cols-2 gap-4 rounded-2xl border p-5 sm:gap-6 sm:p-6 lg:grid-cols-3 xl:grid-cols-6"
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]"
      >
        <Card className="rounded-2xl"
        >
          <CardHeader>
            <CardTitle>模块资源趋势</CardTitle>
            <CardDescription>按模块统计前端已接入的资源数量。</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={trendChartConfig} className="h-[320px] w-full"
            >
              <AreaChart accessibilityLayer data={trend}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="var(--color-count)"
                  fillOpacity={0.2}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl"
        >
          <CardHeader>
            <CardTitle>模块占比</CardTitle>
            <CardDescription>当前后台覆盖的资源按模块拆分。</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={mixChartConfig} className="mx-auto h-[280px] w-full max-w-[280px]"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={moduleMix} dataKey="value" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2} />
              </PieChart>
            </ChartContainer>
            <Separator className="my-4" />
            <div className="grid gap-2 text-sm"
            >
              {moduleMix.slice(0, 6).map((item) => (
                <div key={item.label} className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl"
      >
        <CardHeader>
          <CardTitle>最近业务活动</CardTitle>
          <CardDescription>来自订单、支付与事件表的最近记录。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3"
        >
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground"
            >
              暂无数据。先完成租户开通或商城闭环演练。
            </div>
          ) : (
            recent.map((item) => (
              <div
                key={`${item.title}-${item.meta ?? ""}`}
                className="flex flex-col gap-2 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1"
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                </div>
                <div className="flex items-center gap-3"
                >
                  {item.meta ? <span className="text-sm text-muted-foreground">{item.meta}</span> : null}
                  {item.href ? (
                    <Button asChild size="sm" variant="ghost"
                    >
                      <Link href={item.href}>查看</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
