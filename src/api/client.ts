import type {
  CreateRunRequest,
  CreateRunResponse,
  ListRunsResponse,
  ProofRunDetail,
  SettingsData,
} from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY;

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (API_KEY) {
    headers.set("Authorization", `Bearer ${API_KEY}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = await safeJson(response);
    const error = (payload as any)?.error;
    const message =
      error?.message ??
      response.statusText ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createRun(body: CreateRunRequest) {
  return request<CreateRunResponse>("/runs", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getRun(runId: string) {
  return request<ProofRunDetail>(`/runs/${encodeURIComponent(runId)}`);
}

export function listRuns(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (params?.limit != null) query.set("limit", params.limit.toString());
  if (params?.offset != null) query.set("offset", params.offset.toString());
  if (params?.status) query.set("status", params.status);

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return request<ListRunsResponse>(`/runs${suffix}`);
}

export function getSettings() {
  return request<SettingsData>("/settings");
}

export function updateSettings(payload: SettingsData) {
  return request<SettingsData>("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function resetSettings() {
  return request<SettingsData>("/settings/reset", {
    method: "POST",
  });
}
