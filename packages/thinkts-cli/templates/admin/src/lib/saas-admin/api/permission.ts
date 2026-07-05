import { apiRequest } from "./core";
import type { AdminSession } from "../types";

export async function assignPermissionRoleUser(
  session: AdminSession,
  input: { userId: number; roleId: number },
) {
  return apiRequest<Record<string, unknown>>("/permission/user/role/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function grantPermissionToRole(
  session: AdminSession,
  input: {
    roleId: number;
    moduleCode?: string;
    resourceCode?: string;
    permissionCode: string;
  },
) {
  return apiRequest<Record<string, unknown>>("/permission/role/permission/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function syncPermissionRoleUsers(
  session: AdminSession,
  input: {
    roleId: number;
    moduleCode?: string;
    resourceCode?: string;
    userIds: number[];
  },
) {
  return apiRequest<Record<string, unknown>>("/open/permission/role-users/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function syncPermissionRolePermissions(
  session: AdminSession,
  input: {
    roleId: number;
    moduleCode?: string;
    resourceCode?: string;
    permissionCodes: string[];
    menuIds?: number[];
  },
) {
  return apiRequest<Record<string, unknown>>("/open/permission/role-permissions/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function upsertRoleDataScope(
  session: AdminSession,
  input: {
    roleId: number;
    moduleCode?: string;
    resourceCode?: string;
    resourceId?: number;
    scopeType?: string;
    scopeValues?: string[];
    scopeValueJson?: string;
  },
) {
  return apiRequest<Record<string, unknown>>("/permission/data/scope/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}
