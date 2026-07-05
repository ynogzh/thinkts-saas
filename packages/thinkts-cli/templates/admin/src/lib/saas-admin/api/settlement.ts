import { apiRequest } from "./core";
import type { AdminSession } from "../types";

export async function fetchReceiverSettlementOverview(
  session: AdminSession,
  receiverType?: string,
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/revenue/share/receiverOverview", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: {
      tenant_id: session.user.tenant_id,
      ...(receiverType ? { receiver_type: receiverType } : {}),
    },
  });
}

export async function createReceiverSettlement(
  session: AdminSession,
  input: { receiverType: string; receiverId: number },
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/revenue/share/createSettlement", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id, ...input } as Record<string, unknown>,
  });
}

export async function createBatchSettlement(
  session: AdminSession,
  receiverType?: string,
) {
  return apiRequest<Record<string, unknown>>("/api/iotbiz/revenue/share/createBatchSettlement", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: {
      tenant_id: session.user.tenant_id,
      ...(receiverType ? { receiver_type: receiverType } : {}),
    },
  });
}

export async function fetchPayoutRecords(session: AdminSession, status?: string) {
  return apiRequest<Record<string, unknown>>("/api/trade/settle/order/payout-records", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: {
      tenant_id: session.user.tenant_id,
      ...(status ? { status } : {}),
    },
  });
}

export async function fetchReconciliationOverview(session: AdminSession) {
  return apiRequest<Record<string, unknown>>(
    "/api/trade/settle/order/reconciliation-overview",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      body: { tenant_id: session.user.tenant_id },
    },
  );
}

export async function markSettlementProcessing(
  session: AdminSession,
  settlementId: number,
) {
  return apiRequest<Record<string, unknown>>("/api/trade/settle/order/mark-processing", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id, id: settlementId } as Record<string, unknown>,
  });
}

export async function markSettlementPaid(session: AdminSession, settlementId: number) {
  return apiRequest<Record<string, unknown>>("/api/trade/settle/order/mark-paid", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id, id: settlementId } as Record<string, unknown>,
  });
}

export async function markSettlementFailed(session: AdminSession, settlementId: number) {
  return apiRequest<Record<string, unknown>>("/api/trade/settle/order/mark-failed", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { tenant_id: session.user.tenant_id, id: settlementId } as Record<string, unknown>,
  });
}
