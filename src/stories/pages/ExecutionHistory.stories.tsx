import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExecutionHistoryPage } from "../../pages/ExecutionHistory";
import type { ListRunsResponse, ProofRunDetail } from "../../api/types";

const meta: Meta<typeof ExecutionHistoryPage> = {
  title: "Pages/ExecutionHistory",
  component: ExecutionHistoryPage,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExecutionHistoryPage>;

const runsKey = ["runs", { limit: 20, status: undefined }];
const runDetailKey = ["run", "RUN-20251010-001"];

const historyRuns: ListRunsResponse = {
  runs: [
    {
      id: "RUN-20251010-001",
      timestamp: "2025-10-10T21:20:00Z",
      status: "completed",
      lii: 86,
      duration: 35000,
    },
    {
      id: "RUN-20251010-000",
      timestamp: "2025-10-10T20:55:00Z",
      status: "failed",
      lii: 59,
      duration: 42000,
    },
  ],
  total: 2,
};

const historyDetail: ProofRunDetail = {
  id: "RUN-20251010-001",
  status: "completed",
  timestamp: "2025-10-10T21:20:00Z",
  duration: 35000,
  result: {
    valid: true,
    lii: 86,
    lci: [78, 92],
    steps: [],
    feedback: [],
  },
};

const ExecutionHistoryWithData = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.setQueryData(runsKey, historyRuns);
    queryClient.setQueryData(runDetailKey, historyDetail);
  }, [queryClient]);

  return <ExecutionHistoryPage />;
};

export const Default: Story = {
  render: () => <ExecutionHistoryWithData />,
};
