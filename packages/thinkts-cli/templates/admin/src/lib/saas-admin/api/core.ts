function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const w = window as { __API_BASE_URL__?: string };
    return w.__API_BASE_URL__ ?? "";
  }
  return process.env.SAAS_API_BASE_URL ?? "http://127.0.0.1:3334";
}

function resolveRequestPath(path: string): string {
  return path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${trimTrailingSlash(getApiBaseUrl())}/${trimTrailingSlash(path)}`;
}

export function buildApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const url = new URL(resolveRequestPath(path));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
  }
}

function getErrmsg(payload: Record<string, unknown>): string | undefined {
  if ("errmsg" in payload && typeof payload.errmsg === "string") {
    return payload.errmsg;
  }
  return undefined;
}

function unwrapEntity<T>(payload: Record<string, unknown>): T {
  if (payload.errno !== undefined && payload.errno !== 0) {
    const msg = getErrmsg(payload);
    throw new Error(msg ?? "API error");
  }
  return (payload.data ?? payload) as T;
}

export async function apiRequest<T = Record<string, unknown>>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined | null>;
  } = {},
): Promise<T> {
  const isClient = typeof window !== "undefined";
  const requestPath =
    isClient && !path.startsWith("http://") && !path.startsWith("https://")
      ? `/api/proxy${path}`
      : path;
  const url = buildApiUrl(requestPath, options.params);
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!response.ok) {
    const payload = await parseJsonResponse(response).catch(() => ({} as Record<string, unknown>));
    const msg = getErrmsg(payload);
    throw new Error(msg ?? `HTTP ${response.status}`);
  }
  return unwrapEntity<T>(await parseJsonResponse(response));
}

export { trimTrailingSlash, parseJsonResponse, getErrmsg };
