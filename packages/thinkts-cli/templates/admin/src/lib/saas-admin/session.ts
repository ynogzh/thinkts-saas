import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AdminSession, AdminSessionUser } from "./types";

export const SAAS_TOKEN_COOKIE = "saas_admin_token";
export const SAAS_USER_COOKIE = "saas_admin_user";

function safeJsonParse<T>(value?: string): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SAAS_TOKEN_COOKIE)?.value;
  const user = safeJsonParse<AdminSessionUser>(store.get(SAAS_USER_COOKIE)?.value);
  if (!token || !user?.id || !user.tenant_id) return null;
  return { token, user };
}

export async function requireServerSession(): Promise<AdminSession> {
  const session = await getServerSession();
  if (!session) redirect("/login");
  return session;
}

export async function writeServerSession(session: AdminSession): Promise<void> {
  const store = await cookies();
  store.set(SAAS_TOKEN_COOKIE, session.token, {
    path: "/",
    sameSite: "lax",
    secure: false,
    httpOnly: false,
    maxAge: 60 * 60 * 24,
  });
  store.set(SAAS_USER_COOKIE, JSON.stringify(session.user), {
    path: "/",
    sameSite: "lax",
    secure: false,
    httpOnly: false,
    maxAge: 60 * 60 * 24,
  });
}

export async function clearServerSession(): Promise<void> {
  const store = await cookies();
  store.delete(SAAS_TOKEN_COOKIE);
  store.delete(SAAS_USER_COOKIE);
}

export function initialsFromUser(user: Pick<AdminSessionUser, "name" | "username" | "email">): string {
  const source = user.name || user.username || user.email || "Admin";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AD";
}
