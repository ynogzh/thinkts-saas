"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminSession } from "@/lib/saas-admin/types";

export interface AsyncActionState {
  error: string | null;
  result: Record<string, unknown> | null;
  pending: boolean;
  run: <T>(
    fn: (session: AdminSession) => Promise<T>,
    errorLabel?: string,
  ) => void;
}

/**
 * Shared hook for async action handlers across SaaS workflow panels.
 *
 * Encapsulates the ~30 duplicated patterns of:
 *   useTransition + useState(error/result) + try/catch + router.refresh
 */
export function useAsyncAction(session: AdminSession): AsyncActionState {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [pending, startTransition] = useTransition();

  const run = <T>(
    fn: (session: AdminSession) => Promise<T>,
    errorLabel = "操作失败",
  ) => {
    startTransition(async () => {
      try {
        setError(null);
        const payload = await fn(session);
        setResult(payload as Record<string, unknown>);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : errorLabel);
      }
    });
  };

  return { error, result, pending, run };
}
