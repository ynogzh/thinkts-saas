import type { ThinkContext } from "thinkts";

export interface AdminField {
  field: string;
  label: string;
  type: string;
  listable: boolean;
  searchable: boolean;
  editable: boolean;
  required: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  precision?: number;
  scale?: number;
  default?: unknown;
  comment?: string;
  isPk: boolean;
  searchType?: string;
  searchOptions?: string[];
  operators?: string[];
  fkTable?: string;
  fkColumn?: string;
}

export interface AuthInfo {
  userId: number;
  tenantId: number;
  role: string;
  username: string;
}

export function extractAuth(ctx: ThinkContext): AuthInfo {
  const user = (ctx?.user as Record<string, unknown> | undefined) ?? {};
  return {
    userId: (user.id ?? user.user_id ?? 0) as number,
    tenantId: (user.tenant_id ?? ctx?.tenantId ?? 0) as number,
    role: String(user.role ?? "guest"),
    username: String(user.username ?? user.name ?? "anonymous"),
  };
}
