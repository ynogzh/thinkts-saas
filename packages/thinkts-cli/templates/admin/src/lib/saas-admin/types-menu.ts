export type MenuItemType = "resource" | "workflow" | "group" | "external";

export interface MenuItemConfig {
  type: MenuItemType;
  code?: string;
  label: string;
  icon?: string;
  order?: number;
  resourcePath?: string;
  href?: string;
  url?: string;
  children?: MenuItemConfig[];
  requiredModules?: string[];
  requiredPermissions?: string[];
  hidden?: boolean;
}

export interface MenuGroupConfig {
  code: string;
  label: string;
  icon?: string;
  order?: number;
  requiredModules?: string[];
  children: MenuItemConfig[];
}
