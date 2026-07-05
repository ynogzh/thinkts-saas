import { apiRequest, getApiBaseUrl, getErrmsg, parseJsonResponse, trimTrailingSlash } from "./core";
import type { AdminOption, AdminSession, ResourceOptionSource, ResourceTableConfig } from "../types";

export async function fetchTableConfig(
  resourcePath: string,
  session: AdminSession,
): Promise<ResourceTableConfig> {
  return apiRequest<ResourceTableConfig>(`/${resourcePath}/table`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });
}

export async function listResource(
  resourcePath: string,
  session: AdminSession,
  params: Record<string, string | number | boolean | undefined | null> = {},
) {
  const payload = await apiRequest<Record<string, unknown>>(`/${resourcePath}/list`, {
    method: "GET",
    headers: { Authorization: `Bearer ${session.token}` },
    params,
  });
  return {
    data: {
      count: Number(payload.count ?? 0),
      data: (payload.data ?? []) as Record<string, unknown>[],
      currentPage: Number(payload.currentPage ?? params.page ?? 1),
      pageSize: Number(payload.pageSize ?? params.pageSize ?? 100),
      totalPages: Number(payload.totalPages ?? 1),
    },
  };
}

export async function fetchResourceOptions(
  session: AdminSession,
  source: ResourceOptionSource,
): Promise<AdminOption[]> {
  const payload = await listResource(source.resource, session, {
    page: 1,
    pageSize: 100,
  });
  const rows = payload.data.data ?? [];
  const valueField = source.valueField ?? "id";
  const options: AdminOption[] = [];
  for (const row of rows) {
    const value = row[valueField];
    if (value === undefined || value === null || value === "") continue;
    const label = [source.labelField ?? "name", valueField]
      .map((field) => row[field])
      .filter((v) => v !== undefined && v !== null && v !== "")
      .map((v) => String(v))
      .join(" · ");
    options.push({ label: label || String(value), value: value as string | number });
  }
  return options;
}

export async function getResourceRecord(
  resourcePath: string,
  id: string | number,
  session: AdminSession,
) {
  return apiRequest<Record<string, unknown>>(`/${resourcePath}/get`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { id } as Record<string, unknown>,
  });
}

export async function createResourceRecord(
  resourcePath: string,
  session: AdminSession,
  body: Record<string, unknown>,
  createPath?: string,
) {
  const targetPath = createPath ? createPath.replace(/^\//, "") : `${resourcePath}/create`;
  return apiRequest<Record<string, unknown>>(`/${targetPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body,
  });
}

export async function updateResourceRecord(
  resourcePath: string,
  id: string | number,
  session: AdminSession,
  body: Record<string, unknown>,
) {
  return apiRequest<Record<string, unknown>>(`/${resourcePath}/update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { ...body, id } as Record<string, unknown>,
  });
}

export async function deleteResourceRecord(
  resourcePath: string,
  id: string | number,
  session: AdminSession,
) {
  return apiRequest<Record<string, unknown>>(`/${resourcePath}/delete`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: { id } as Record<string, unknown>,
  });
}

export async function uploadResourceFile(session: AdminSession, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${trimTrailingSlash(getApiBaseUrl())}/open/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.token}` },
    body: formData,
  });
  if (!response.ok) {
    const payload = await parseJsonResponse(response).catch(() => ({} as Record<string, unknown>));
    const msg = getErrmsg(payload);
    throw new Error(msg ?? `HTTP ${response.status}`);
  }
  const parsed = await parseJsonResponse(response);
  if (parsed.errno !== undefined && parsed.errno !== 0) {
    const msg = getErrmsg(parsed);
    throw new Error(msg ?? "API error");
  }
  const data = (parsed.data ?? parsed) as Record<string, unknown>;
  return {
    file_url: String(data.file_url ?? ""),
    file_name: String(data.file_name ?? ""),
    file_type: String(data.file_type ?? ""),
    file_size: Number(data.file_size ?? 0),
  };
}
