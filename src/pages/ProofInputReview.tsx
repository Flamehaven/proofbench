import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  FormField,
  FormFieldInput,
  FormFieldSelect,
  Alert,
} from "../design-system";
import { useCreateRun, useRun } from "../api/hooks";
import type { FeedbackMessage } from "../core/feedback_generator";
import type { RunStatus } from "../api/types";

const PageWrapper = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const LayoutGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
  gridTemplateColumns: "2fr 1fr",
  "@media (max-width: 1023px)": {
    gridTemplateColumns: "1fr",
  },
}));

const Toolbar = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.tokens.token.spacing.md,
  alignItems: "center",
  justifyContent: "space-between",
}));

const ToolbarGroup = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  gap: "12px",
  alignItems: "center",
});

const EditorArea = styled("textarea")(({ theme }) => ({
  width: "100%",
  minHeight: "320px",
  border: "none",
  outline: "none",
  resize: "vertical",
  fontFamily: "Consolas, Monaco, 'Courier New', monospace",
  fontSize: theme.tokens.token.font.size.md,
  lineHeight: 1.6,
  color: theme.tokens.token.color.text.primary.default[theme.mode],
  backgroundColor: "transparent",
}));

const DropZone = styled("div")(({ theme }) => ({
  border: `2px dashed ${theme.tokens.token.color.text.primary.subtle[theme.mode]}`,
  borderRadius: theme.tokens.token.borderRadius.lg,
  padding: theme.tokens.token.spacing.xl,
  textAlign: "center" as const,
  color: theme.tokens.token.color.text.primary.subtle[theme.mode],
}));

const PanelColumn = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const ValidationList = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.sm,
}));

const StatusText = styled("p")(({ theme }) => ({
  margin: 0,
  fontSize: theme.tokens.token.font.size.sm,
  color: theme.tokens.token.color.text.primary.subtle[theme.mode],
}));

const DEFAULT_FEEDBACK: FeedbackMessage[] = [
  {
    type: "info",
    stepId: "initial",
    summary: "Analysis not yet executed.",
    suggestions: ["Press Run Analysis to generate feedback."],
  },
];

export function ProofInputReviewPage(): JSX.Element {
  const [engine, setEngine] = useState("atlas-1");
  const [proofText, setProofText] = useState(`Given triangle ABC with AB = AC, prove angle B equals angle C.

1. Because AB equals AC, triangle ABC is isosceles.
2. Therefore the base angles at B and C are equal.
3. Conclude angle B equals angle C.`);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);

  const createRun = useCreateRun();
  const {
    data: runDetail,
    isFetching: isRunFetching,
    error: runError,
  } = useRun(activeRunId ?? undefined, { enabled: Boolean(activeRunId) });

  const runMessages = useMemo(() => {
    if (runDetail?.result?.feedback?.length) {
      return runDetail.result.feedback;
    }
    if (runDetail?.status === "failed" && runDetail.error) {
      return [
        {
          type: "error",
          stepId: "error",
          summary: "Analysis failed",
          suggestions: [runDetail.error.message],
        } satisfies FeedbackMessage,
      ];
    }
    return DEFAULT_FEEDBACK;
  }, [runDetail]);

  const currentStatus: RunStatus | undefined = runDetail?.status;
  const isBusy = createRun.isPending || isRunFetching;

  const handleRun = () => {
    if (!proofText.trim()) return;
    createRun.mutate(
      {
        proofScript: proofText,
        config: { model: engine },
      },
      {
        onSuccess: (response) => setActiveRunId(response.runId),
      },
    );
  };

  return (
    <PageWrapper>
      <header>
        <h1>Proof Input &amp; Review</h1>
        <p>Draft or upload your proof, then run the hybrid analysis pipeline.</p>
      </header>

      <Toolbar>
        <ToolbarGroup>
          <FormField
            label="Semantic Model"
            helpText="Select the consensus adapter used during analysis."
          >
            <FormFieldSelect
              value={engine}
              onChange={(event) => setEngine(event.target.value)}
              disabled={isBusy}
            >
              <option value="atlas-1">Atlas-1 (balanced reasoning)</option>
              <option value="orion-2">Orion-2 (formal logic)</option>
              <option value="helios-3">Helios-3 (symbolic heavy)</option>
            </FormFieldSelect>
          </FormField>
        </ToolbarGroup>

        <ToolbarGroup>
          <Button variant="secondary" disabled={isBusy}>
            Load Draft
          </Button>
          <Button variant="primary" disabled={isBusy}>
            Save Draft
          </Button>
        </ToolbarGroup>
      </Toolbar>

      <LayoutGrid>
        <Card variant="default" isHoverable>
          <CardHeader>Proof Draft</CardHeader>
          <CardBody>
            <EditorArea
              value={proofText}
              onChange={(event) => setProofText(event.target.value)}
              aria-label="Proof editor"
              disabled={isBusy}
            />
          </CardBody>
          <CardBody>
            <DropZone>Drag and drop a proof file here, or click to browse.</DropZone>
          </CardBody>
        </Card>

        <PanelColumn>
          <Card variant="default">
            <CardHeader>Real-time Validation</CardHeader>
            <CardBody>
              {activeRunId && (
                <StatusText>
                  Current status: <strong>{currentStatus ?? "queued"}</strong>
                </StatusText>
              )}
              {createRun.error && (
                <Alert variant="banner" layout="inline" status="error" title="Failed to start analysis">
                  {createRun.error.message}
                </Alert>
              )}
              {runError && (
                <Alert variant="banner" layout="inline" status="error" title="Analysis error">
                  {runError.message}
                </Alert>
              )}
              <ValidationList>
                {runMessages.map((item) => (
                  <Alert
                    key={String(item.stepId)}
                    variant="banner"
                    layout="inline"
                    status="info"
                    title={item.summary}
                  >
                    {item.suggestions?.join(" ") || ""}
                  </Alert>
                ))}
              </ValidationList>
            </CardBody>
          </Card>

          <Card variant="default">
            <CardBody>
              <Button
                variant="primary"
                size="lg"
                onClick={handleRun}
                disabled={createRun.isPending}
              >
                {isBusy ? "Running analysis..." : "Run Analysis"}
              </Button>
            </CardBody>
          </Card>
        </PanelColumn>
      </LayoutGrid>
    </PageWrapper>
  );
}
