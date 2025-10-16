import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HybridDashboardPage } from "../../pages/HybridDashboard";
import type { ProofRunDetail, ListRunsResponse } from "../../api/types";

const meta: Meta<typeof HybridDashboardPage> = {
  title: "Pages/HybridDashboard",
  component: HybridDashboardPage,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HybridDashboardPage>;

const runsListKey = ["runs", { limit: 5 }];
const runDetailKey = ["run", "RUN-001"];

const mockRuns: ListRunsResponse = {
  runs: [
    {
      id: "RUN-001",
      timestamp: "2025-10-10T21:20:00Z",
      status: "completed",
      lii: 86,
      duration: 35000,
    },
    {
      id: "RUN-000",
      timestamp: "2025-10-10T20:55:00Z",
      status: "failed",
      lii: 59,
      duration: 42000,
    },
  ],
  total: 2,
};

const mockRunDetail: ProofRunDetail = {
  id: "RUN-001",
  status: "completed",
  timestamp: "2025-10-10T21:20:00Z",
  duration: 35000,
  result: {
    valid: true,
    lii: 86,
    lci: [78, 92],
    steps: [
      {
        stepId: "A1",
        symbolic: { valid: true, diagnostics: "algebra" },
        consensus: {
          results: [
            { model: "atlas-1", score: 84, rationale: "Consistent reasoning" },
            { model: "orion-2", score: 80, rationale: "Aligns with theorem usage" },
          ],
          mean: 82,
          variance: 20,
          coherence: 90,
        },
        lii: 86,
        lci: [78, 92],
        pass: true,
      },
      {
        stepId: "A2",
        symbolic: { valid: false, difference: "x - y^2", diagnostics: "algebra" },
        consensus: {
          results: [
            { model: "atlas-1", score: 62, rationale: "Missing justification" },
            { model: "orion-2", score: 58, rationale: "Inconsistent transition" },
          ],
          mean: 60,
          variance: 25,
          coherence: 72,
        },
        lii: 59,
        lci: [48, 70],
        pass: false,
      },
    ],
    graphData: {
      nodes: [
        { id: "Input", dependencies: [] },
        { id: "Symbolic", dependencies: ["Input"] },
        { id: "Semantic", dependencies: ["Input"] },
        { id: "Hybrid", dependencies: ["Symbolic", "Semantic"] },
      ],
      hasCycle: false,
      depth: 3,
    },
    feedback: [
      {
        type: "warning",
        stepId: "A2",
        summary: "Semantic coherence warning.",
        suggestions: ["Provide justification for base angle equality."],
      },
    ],
  },
};

const DashboardWithData = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.setQueryData(runsListKey, mockRuns);
    queryClient.setQueryData(runDetailKey, mockRunDetail);
  }, [queryClient]);

  return <HybridDashboardPage />;
};

export const Default: Story = {
  render: () => <DashboardWithData />,
};
