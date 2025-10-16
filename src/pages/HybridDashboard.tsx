import { useMemo } from "react";
import styled from "@emotion/styled";
import type { HybridStepResult } from "../core/hybrid_engine";
import StepResultsPanel from "../ui/StepResultsPanel";
import FeedbackPanel from "../ui/FeedbackPanel";
import JustificationView from "../ui/JustificationView";
import { JustificationAnalyzer } from "../core/justification_analyzer";
import { FeedbackGenerator } from "../core/feedback_generator";
import { Card, CardBody } from "../design-system";

const analyzer = new JustificationAnalyzer();
const feedbackGenerator = new FeedbackGenerator();

const mockResults: HybridStepResult[] = [
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
];

const PageWrapper = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

const KPIGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
}));

const LayoutGrid = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
  gridTemplateColumns: "2fr 1fr",
  "@media (max-width: 1200px)": {
    gridTemplateColumns: "1fr",
  },
}));

const SideColumn = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.tokens.token.spacing.lg,
}));

export function HybridDashboardPage(): JSX.Element {
  const graph = useMemo(
    () =>
      analyzer.buildGraph([
        { id: "Input", dependencies: [] },
        { id: "Symbolic", dependencies: ["Input"] },
        { id: "Semantic", dependencies: ["Input"] },
        { id: "Hybrid", dependencies: ["Symbolic", "Semantic"] },
      ]),
    [],
  );

  const feedbackMessages = useMemo(
    () =>
      mockResults.map((result) =>
        feedbackGenerator.generate(
          result.stepId,
          result.symbolic.valid,
          result.consensus.coherence,
          [],
        ),
      ),
    [],
  );

  const summary = useMemo(() => {
    const aggregateLii =
      mockResults.reduce((acc, item) => acc + item.lii, 0) /
      (mockResults.length || 1);

    const aggregateCoherence =
      mockResults.reduce((acc, item) => acc + item.consensus.coherence, 0) /
      (mockResults.length || 1);

    const passCount = mockResults.filter((item) => item.pass).length;

    return {
      aggregateLii: Math.round(aggregateLii),
      aggregateCoherence: Math.round(aggregateCoherence),
      passRate: mockResults.length
        ? Math.round((passCount / mockResults.length) * 100)
        : 0,
    };
  }, []);

  return (
    <PageWrapper>
      <header>
        <h1>Hybrid Reasoning Dashboard</h1>
        <p>Monitor proof validation metrics, justification graphs, and feedback in real-time.</p>
      </header>

      <KPIGrid>
        <Card variant="kpi">
          <CardBody>
            <p>Aggregate LII</p>
            <h2>{summary.aggregateLii}</h2>
          </CardBody>
        </Card>
        <Card variant="kpi">
          <CardBody>
            <p>Mean Coherence</p>
            <h2>{summary.aggregateCoherence}</h2>
          </CardBody>
        </Card>
        <Card variant="kpi">
          <CardBody>
            <p>Pass Rate</p>
            <h2>{summary.passRate}%</h2>
          </CardBody>
        </Card>
      </KPIGrid>

      <LayoutGrid>
        <div>
          <StepResultsPanel results={mockResults} />
          <FeedbackPanel messages={feedbackMessages} />
        </div>

        <SideColumn>
          <JustificationView graph={graph} />
          <Card variant="default">
            <CardBody>
              <h3>Run Log</h3>
              <ul>
                <li>2025-10-10 21:20 — LII 86 — Pass</li>
                <li>2025-10-10 20:55 — LII 59 — Needs Review</li>
                <li>2025-10-10 20:15 — LII 92 — Pass</li>
              </ul>
            </CardBody>
          </Card>
        </SideColumn>
      </LayoutGrid>
    </PageWrapper>
  );
}
