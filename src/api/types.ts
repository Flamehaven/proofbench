import type { HybridStepResult } from "../core/hybrid_engine";
import type { JustificationGraph } from "../core/justification_analyzer";
import type { FeedbackMessage } from "../core/feedback_generator";

export type RunStatus = "pending" | "running" | "completed" | "failed";

export interface ProofRunSummary {
  id: string;
  timestamp: string;
  status: "completed" | "failed" | "running" | "pending";
  lii?: number;
  duration?: number;
}

export interface ProofRunResult {
  valid: boolean;
  lii: number;
  lci: [number, number];
  steps: HybridStepResult[];
  graphData?: JustificationGraph;
  feedback: FeedbackMessage[];
}

export interface ProofRunDetail {
  id: string;
  status: RunStatus;
  timestamp: string;
  duration?: number;
  result?: ProofRunResult;
  error?: {
    code: string;
    message: string;
  };
}

export interface ListRunsResponse {
  runs: ProofRunSummary[];
  total: number;
}

export interface CreateRunRequest {
  proofScript: string;
  config?: Record<string, unknown>;
}

export interface CreateRunResponse {
  runId: string;
  status: "pending";
}

export interface SettingsData {
  engine: string;
  tokenBudget: number;
  animations: boolean;
  highContrast: boolean;
}
