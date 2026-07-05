import { apiRequest } from "./core";
import type { AdminSession } from "../types";

export async function executeCommerceFlow(
  session: AdminSession,
  input: {
    tenantId?: number;
    productCount?: number;
    orderCount?: number;
    paymentSuccessRate?: number;
    refundRate?: number;
    productName?: string;
    productPrice?: number;
    username?: string;
    password?: string;
    memberUsername?: string;
    packageName?: string;
    packagePrice?: number;
    rechargeAmount?: number;
    devicePrice?: number;
    quantity?: number;
  },
) {
  return apiRequest<Record<string, unknown>>("/open/flow/commerce", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function executeSharedDeviceFlow(
  session: AdminSession,
  input: {
    tenantId?: number;
    agentCount?: number;
    merchantCount?: number;
    deviceCount?: number;
    agentUsername?: string;
    merchantName?: string;
    merchantContactName?: string;
    merchantContactPhone?: string;
    deviceCategory?: string;
    settlementCycle?: string;
    deviceTypeName?: string;
    deviceUnitPrice?: number;
    password?: string;
    memberUsername?: string;
    packageName?: string;
    packagePrice?: number;
    rechargeAmount?: number;
    devicePrice?: number;
    packageCount?: number;
    sessionCount?: number;
    refundRate?: number;
    revenueShareRate?: number;
  },
) {
  return apiRequest<Record<string, unknown>>("/open/flow/sharedDevice", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function executeMerchantOnboardingFlow(
  session: AdminSession,
  input: {
    tenantId?: number;
    agentCount?: number;
    merchantCount?: number;
    deviceCount?: number;
    agentUsername?: string;
    merchantName?: string;
    merchantContactName?: string;
    merchantContactPhone?: string;
    deviceCategory?: string;
    settlementCycle?: string;
    deviceTypeName?: string;
    deviceUnitPrice?: number;
    password?: string;
    memberUsername?: string;
    packageName?: string;
    packagePrice?: number;
    rechargeAmount?: number;
    devicePrice?: number;
  },
) {
  return apiRequest<Record<string, unknown>>("/open/flow/merchantOnboarding", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function requestDeviceSessionRefund(
  session: AdminSession,
  input: { sessionId: number; amount: number; reason: string },
) {
  return apiRequest<Record<string, unknown>>("/open/flow/refund", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}

export async function compensatePaidPayment(
  session: AdminSession,
  input: { payNo?: string; paymentOrderId?: number; reason?: string },
) {
  return apiRequest<Record<string, unknown>>("/open/flow/compensate", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: input as Record<string, unknown>,
  });
}
