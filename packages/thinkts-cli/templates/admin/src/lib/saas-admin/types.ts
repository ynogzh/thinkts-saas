import type { LucideIcon } from "lucide-react";

export interface AdminSessionUser {
  id: number;
  email?: string;
  username?: string;
  name?: string;
  role: string;
  role_id?: number;
  tenant_id: number;
  tenant_code?: string;
  main_dept_id?: number;
  user_type?: string;
}

export interface AdminSession {
  token: string;
  user: AdminSessionUser;
}

export interface AdminOption {
  label: string;
  value: string | number;
}

export interface ResourceOptionSource {
  resource: string;
  labelField: string;
  valueField: string;
  filter?: Record<string, unknown>;
}

export interface ResourceFieldConfig {
  field: string;
  title: string;
  type: "text" | "number" | "textarea" | "select" | "switch" | "date" | "datetime" | "relation" | "json" | "file" | "password" | "richtext" | "hidden";
  required?: boolean;
  readonly?: boolean;
  options?: AdminOption[];
  optionsSource?: ResourceOptionSource;
  relation?: { model: string; labelField: string; valueField: string };
  width?: string;
  placeholder?: string;
  description?: string;
}

export interface ActionLinkConfig {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export interface ResourceSearchConfig {
  fields?: ResourceFieldConfig[];
}

export interface ResourceFormGroupConfig {
  title?: string;
  description?: string;
  fields: ResourceFieldConfig[];
}

export interface ResourceTableConfig {
  title?: string;
  description?: string;
  model?: string;
  columns?: ResourceFieldConfig[];
  list?: {
    pageSize?: number;
    order?: string;
  };
  search?: ResourceSearchConfig;
  form?: {
    groups: ResourceFormGroupConfig[];
  };
}

export interface ResourcePageConfig {
  code: string;
  label: string;
  title: string;
  description: string;
  moduleCode: string;
  icon: LucideIcon;
  path: string;
  model: string;
  createPath?: string;
  readOnly?: boolean;
  defaultValues?: Record<string, unknown>;
  createExtraFields?: string[];
  actionLinks?: ActionLinkConfig[];
  fieldOverrides?: Record<string, Partial<ResourceFieldConfig>>;
}

export interface ModulePageConfig {
  code: string;
  label: string;
  description: string;
  icon: LucideIcon;
  resources: Array<{ path: string; title: string; description: string }>;
}

export interface OverviewStat {
  label: string;
  value: number;
  change?: number;
  tone?: "neutral" | "positive" | "warning";
  icon?: string;
  previousValue?: string;
}

export interface TrendPoint {
  label: string;
  count: number;
}

export interface DoughnutPoint {
  label: string;
  value: number;
}

export interface RecentActivityItem {
  title: string;
  subtitle: string;
  meta?: string;
  href?: string;
}

export interface SharedDeviceOverview {
  devicesTotal: number;
  devicesOnline: number;
  sessionsCompleted: number;
  sessionsRefunded: number;
  totalRevenue: number;
  pendingShare: number;
}

export interface OverviewData {
  stats: OverviewStat[];
  trend: TrendPoint[];
  moduleMix: DoughnutPoint[];
  recent: RecentActivityItem[];
  sharedDevice?: SharedDeviceOverview;
}
