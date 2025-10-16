import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  createRun,
  getRun,
  listRuns,
  getSettings,
  updateSettings,
  resetSettings,
} from "./client";
import type {
  CreateRunRequest,
  CreateRunResponse,
  ListRunsResponse,
  ProofRunDetail,
  SettingsData,
} from "./types";

const queryKeys = {
  runs: (params?: { limit?: number; offset?: number; status?: string }) => [
    "runs",
    params ?? {},
  ],
  run: (runId?: string) => ["run", runId],
  settings: ["settings"],
} as const;

export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation<CreateRunResponse, Error, CreateRunRequest>({
    mutationFn: (body) => createRun(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.runs({}) });
    },
    onError: (error) => {
      console.error("Error creating run:", error.message);
    },
  });
}

export function useRun(
  runId?: string,
  options?: Omit<
    UseQueryOptions<ProofRunDetail>,
    "queryKey" | "queryFn" | "enabled"
  > & { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.run(runId),
    queryFn: () => {
      if (!runId) {
        throw new Error("runId is required");
      }
      return getRun(runId);
    },
    enabled: options?.enabled ?? Boolean(runId),
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === "completed" || data?.status === "failed" ? false : 2000;
    },
    ...options,
  });
}

export function useRuns(params?: {
  limit?: number;
  offset?: number;
  status?: string;
}) {
  return useQuery<ListRunsResponse>({
    queryKey: queryKeys.runs(params),
    queryFn: () => listRuns(params),
  });
}

export function useSettings() {
  return useQuery<SettingsData>({
    queryKey: queryKeys.settings,
    queryFn: () => getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<SettingsData, Error, SettingsData>({
    mutationFn: (payload) => updateSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings, data);
    },
    onError: (error) => {
      console.error("Error updating settings:", error.message);
    },
  });
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  return useMutation<SettingsData, Error, void>({
    mutationFn: () => resetSettings(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.settings, data);
    },
    onError: (error) => {
      console.error("Error resetting settings:", error.message);
    },
  });
}
