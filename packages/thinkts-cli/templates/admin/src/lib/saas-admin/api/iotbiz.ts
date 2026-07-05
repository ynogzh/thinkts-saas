import { apiRequest } from "./core";
import type { AdminSession } from "../types";

export async function fetchSharedDeviceOverview(session: AdminSession) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/session/overview", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
  });
}

export async function fetchMerchantWorkbench(session: AdminSession) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/merchant/workbench", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id },
  });
}

export async function fetchAgentWorkbench(session: AdminSession) {
  return apiRequest<Record<string, unknown>>("/api/promote/agent/workbench", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id },
  });
}

export async function runHeartbeatSweep(
  session: AdminSession,
  staleAfterMinutes = 10,
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/device/heartbeatSweep", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { stale_after_minutes: staleAfterMinutes } as Record<string, unknown>,
  });
}

export async function runCleanupSweep(
  session: AdminSession,
  input?: { paymentTimeoutMinutes?: number; startTimeoutMinutes?: number },
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/session/cleanupSweep", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: (input ?? {}) as Record<string, unknown>,
  });
}

export async function restoreDeviceOnline(
  session: AdminSession,
  input: { deviceId: number; reason?: string },
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/device/restoreOnline", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function resolveDeviceAlert(
  session: AdminSession,
  input: { deviceId?: number; eventId?: number; reason?: string },
) {
  return apiRequest<Record<string, unknown>>("/open/iotbiz/device/resolve-alert", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function ensureSharedDeviceDashboard(session: AdminSession) {
  return apiRequest<Record<string, unknown>>("/api/dashboard/dashboard/ensureSharedDevice", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
  });
}
