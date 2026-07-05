"use client";

import { Card, CardContent } from "@/components/ui/card";

export interface StatCard {
  label: string;
  value: string | number;
}

interface Props {
  items: StatCard[];
  cols?: number;
}

/**
 * Shared stat card grid — replaces ~5 duplicated stat card grids
 * across workflow panels (device-fault, event-ops, settlement, etc.).
 */
export function StatCardGrid({ items, cols = 5 }: Props) {
  const colClass =
    cols === 4 ? "md:grid-cols-2 xl:grid-cols-4"
    : cols === 3 ? "md:grid-cols-3"
    : "md:grid-cols-2 xl:grid-cols-5";

  return (
    <Card className="rounded-3xl">
      <CardContent className={`grid gap-4 ${colClass} text-sm`}>
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border p-4">
            <div className="text-muted-foreground">{item.label}</div>
            <div className="mt-2 text-2xl font-semibold">{item.value}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
