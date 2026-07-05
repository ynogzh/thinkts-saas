import { apiRequest } from "./core";
import type { AdminSession, AdminSessionUser } from "../types";

export async function loginWithPassword(input: {
  tenant_code: string;
  account: string;
  password: string;
}): Promise<{ token: string; user: AdminSessionUser }> {
  return apiRequest<{ token: string; user: AdminSessionUser }>("/open/login", {
    method: "POST",
    body: input as Record<string, unknown>,
  });
}

export async function fetchCurrentUser(token: string): Promise<AdminSessionUser> {
  return apiRequest<AdminSessionUser>("/open/current", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function bootstrapTenant(
  token: string | undefined,
  body: Record<string, unknown>,
) {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return apiRequest<Record<string, unknown>>("/open/bootstrap/tenant", {
    method: "POST",
    body,
    headers,
  });
}

export async function fetchTenantModules(session: AdminSession): Promise<string[]> {
  const payload = await apiRequest<Record<string, unknown>>("/open/tenant/modules", {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  if ("modules" in payload && Array.isArray(payload.modules)) {
    return payload.modules as string[];
  }
  return [];
}
