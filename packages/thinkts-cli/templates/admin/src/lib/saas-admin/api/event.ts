import { apiRequest } from "./core";
import type { AdminSession } from "../types";

export async function fetchEventSummary(session: AdminSession) {
  return apiRequest<Record<string, unknown>>("/api/event/record/summary", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
  });
}

export async function consumeEventRecord(
  session: AdminSession,
  input: { eventId: number },
) {
  return apiRequest<Record<string, unknown>>("/api/event/record/consume", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function testEventWebhookConfig(
  session: AdminSession,
  input: { configId: number },
) {
  return apiRequest<Record<string, unknown>>("/api/event/webhook/config/test", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function retryEventWebhookLog(
  session: AdminSession,
  input: { logId: number },
) {
  return apiRequest<Record<string, unknown>>("/api/event/webhook/log/retry", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}
