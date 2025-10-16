import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardSection,
  Modal,
  FormField,
  FormFieldInput,
  FormFieldSelect,
} from "../design-system";

interface ExecutionRecord {
  id: string;
  timestamp: string;
  lii: number;
  coherence: number;
  duration: string;
  status: "pass" | "fail" | "review";
  summary: string;
}

const PageWrapper = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const Toolbar = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.tokens.token.spacing.md,
  alignItems: "center",
  justifyContent: "space-between",
}));

const ToolbarFilters = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  alignItems: "center",
});

const Feed = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.md,
}));

const StatusBadge = styled("span")<{ status: ExecutionRecord["status"] }>(
  ({ theme, status }) => {
    const colorMap: Record<ExecutionRecord["status"], string> = {
      pass: theme.tokens.token.color.status.success[theme.mode],
      fail: theme.tokens.token.color.status.error[theme.mode],
      review: theme.tokens.token.color.status.warning[theme.mode],
    };
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: theme.tokens.token.borderRadius.full,
      backgroundColor: colorMap[status] + "22",
      color: colorMap[status],
      fontSize: theme.tokens.token.font.size.xs,
      fontWeight: theme.tokens.token.font.weight.medium,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    };
  },
);

const MetaList = styled("ul")({
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: "4px",
  fontSize: "14px",
});

export function ExecutionHistoryPage(): JSX.Element {
  const [selectedRecord, setSelectedRecord] = useState<ExecutionRecord | null>(null);
  const records = useMemo<ExecutionRecord[]>(
    () => [
      {
        id: "RUN-20251010-001",
        timestamp: "2025-10-10 21:20",
        lii: 86,
        coherence: 90,
        duration: "35s",
        status: "pass",
        summary: "Hybrid validation passed; no drift detected.",
      },
      {
        id: "RUN-20251010-000",
        timestamp: "2025-10-10 20:55",
        lii: 59,
        coherence: 72,
        duration: "42s",
        status: "review",
        summary: "Semantic coherence drop. Requires additional justification.",
      },
      {
        id: "RUN-20251010-099",
        timestamp: "2025-10-10 19:48",
        lii: 45,
        coherence: 61,
        duration: "38s",
        status: "fail",
        summary: "Symbolic deviation persisted beyond tolerance.",
      },
    ],
    [],
  );

  return (
    <PageWrapper>
      <header>
        <h1>Execution History</h1>
        <p>
          Review recent ProofEngine runs, inspect validation outcomes, and export reports for auditing.
        </p>
      </header>

      <Toolbar>
        <ToolbarFilters>
          <FormField label="Date Range">
            <FormFieldInput type="date" />
          </FormField>
          <FormField label="Status">
            <FormFieldSelect>
              <option value="all">All</option>
              <option value="pass">Pass</option>
              <option value="review">Needs Review</option>
              <option value="fail">Fail</option>
            </FormFieldSelect>
          </FormField>
        </ToolbarFilters>

        <Button variant="secondary">Export CSV</Button>
      </Toolbar>

      <Feed>
        {records.map((record) => (
          <Card key={record.id} variant="default" isHoverable>
            <CardHeader>
              <span>{record.id}</span>
              <StatusBadge status={record.status}>{record.status}</StatusBadge>
            </CardHeader>
            <CardBody>
              <MetaList>
                <li>Executed: {record.timestamp}</li>
                <li>LII Score: {record.lii}</li>
                <li>Coherence: {record.coherence}</li>
                <li>Duration: {record.duration}</li>
              </MetaList>
            </CardBody>
            <CardBody>{record.summary}</CardBody>
            <CardBody>
              <Button variant="ghost" onClick={() => setSelectedRecord(record)}>
                View Details
              </Button>
            </CardBody>
          </Card>
        ))}
      </Feed>

      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.id}
        size="md"
      >
        {selectedRecord && (
          <>
            <CardSection>
              <p>
                Executed at <strong>{selectedRecord.timestamp}</strong>, completed in{" "}
                <strong>{selectedRecord.duration}</strong>.
              </p>
              <p>
                Hybrid reasoning outcome: LII <strong>{selectedRecord.lii}</strong>, Coherence{" "}
                <strong>{selectedRecord.coherence}</strong>, status{" "}
                <strong>{selectedRecord.status.toUpperCase()}</strong>.
              </p>
            </CardSection>
            <CardSection>
              <h4>Highlights</h4>
              <ul>
                <li>Justification graph snapshot stored as `runs/{selectedRecord.id}/graph.json`.</li>
                <li>Feedback report contains 3 actionable suggestions.</li>
                <li>Drift metrics were within the expected corridor.</li>
              </ul>
            </CardSection>
            <CardSection>
              <Button variant="primary">Open Full Report</Button>
            </CardSection>
          </>
        )}
      </Modal>
    </PageWrapper>
  );
}
