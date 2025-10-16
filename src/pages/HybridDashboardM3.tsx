/**
 * Hybrid Reasoning Dashboard (Material Design 3)
 * Redesigned with Google Stitch M3 specifications
 */

import { useMemo } from 'react';
import styled from '@emotion/styled';
import type { HybridStepResult } from '../core/hybrid_engine';
import { JustificationAnalyzer } from '../core/justification_analyzer';
import { FeedbackGenerator } from '../core/feedback_generator';
import { M3ThemeProvider, useM3Theme } from '../design-system/themes/M3ThemeProvider';
import { MetricCard, Table, StatusBadge, Timeline, Alert, AlertStack, JustificationGraphD3 } from '../design-system/components/m3';
import type { TimelineItem } from '../design-system/components/m3';

const analyzer = new JustificationAnalyzer();
const feedbackGenerator = new FeedbackGenerator();

const mockResults: HybridStepResult[] = [
  {
    stepId: 'Step 1',
    symbolic: { valid: true, diagnostics: 'Initial Hypothesis' },
    consensus: {
      results: [
        { model: 'GPT-4o', score: 84, rationale: 'Consistent reasoning' },
        { model: 'Claude-3.5', score: 80, rationale: 'Aligns with theorem usage' },
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
    stepId: 'Step 2',
    symbolic: { valid: true, diagnostics: 'Evidence Gathering' },
    consensus: {
      results: [
        { model: 'GPT-4o', score: 88, rationale: 'Strong logical flow' },
        { model: 'Claude-3.5', score: 85, rationale: 'Well-supported claims' },
      ],
      mean: 86,
      variance: 15,
      coherence: 92,
    },
    lii: 88,
    lci: [82, 94],
    pass: true,
  },
  {
    stepId: 'Step 3',
    symbolic: { valid: true, diagnostics: 'Reasoning' },
    consensus: {
      results: [
        { model: 'GPT-4o', score: 90, rationale: 'Excellent deduction' },
        { model: 'Claude-3.5', score: 87, rationale: 'Sound logical steps' },
      ],
      mean: 88,
      variance: 12,
      coherence: 94,
    },
    lii: 91,
    lci: [85, 97],
    pass: true,
  },
  {
    stepId: 'Step 4',
    symbolic: { valid: true, diagnostics: 'Conclusion' },
    consensus: {
      results: [
        { model: 'GPT-4o', score: 85, rationale: 'Valid conclusion' },
        { model: 'Claude-3.5', score: 82, rationale: 'Follows from premises' },
      ],
      mean: 83,
      variance: 18,
      coherence: 88,
    },
    lii: 87,
    lci: [80, 93],
    pass: true,
  },
  {
    stepId: 'Step 5',
    symbolic: { valid: false, difference: 'x - y^2', diagnostics: 'Validation' },
    consensus: {
      results: [
        { model: 'GPT-4o', score: 62, rationale: 'Missing justification' },
        { model: 'Claude-3.5', score: 58, rationale: 'Inconsistent transition' },
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

// Styled Components with animations
const PageContainer = styled.div(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.colors.background,
  display: 'flex',
  flexDirection: 'column',
  animation: 'fadeIn 0.3s ease-in-out',

  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
}));

const Header = styled.header(({ theme }) => ({
  backgroundColor: theme.colors.surface,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `0 ${theme.spacing(3)}`,
  height: '64px',
  borderBottom: `1px solid ${theme.colors.outlineVariant}`,
}));

const LogoSection = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const Logo = styled.div(({ theme }) => ({
  width: '32px',
  height: '32px',
  backgroundColor: theme.colors.primary,
  borderRadius: theme.borderRadius.sm,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.onPrimary,
  fontWeight: 700,
  fontSize: '16px',
}));

const AppTitle = styled.h1(({ theme }) => ({
  ...theme.typography.titleLarge,
  color: theme.colors.onSurface,
  margin: 0,
}));

const HeaderActions = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const IconButton = styled.button(({ theme }) => ({
  width: '40px',
  height: '40px',
  borderRadius: theme.borderRadius.full,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  transition: `background-color ${theme.transitions.duration.shorter} ${theme.transitions.easing.easeInOut}`,

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  '& .material-symbols-outlined': {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '20px',
    color: theme.colors.onSurfaceVariant,
  },
}));

const Main = styled.main(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
}));

const ContentWrapper = styled.div(({ theme }) => ({
  maxWidth: '1400px',
  margin: '0 auto',
}));

const PageHeader = styled.div(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const PageTitle = styled.h2(({ theme }) => ({
  ...theme.typography.headlineMedium,
  color: theme.colors.onSurface,
  margin: 0,
  marginBottom: theme.spacing(0.5),
}));

const PageSubtitle = styled.p(({ theme }) => ({
  ...theme.typography.bodyMedium,
  color: theme.colors.onSurfaceVariant,
  margin: 0,
}));

const MetricsGrid = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(3),

  '& > *': {
    animation: 'slideUp 0.4s ease-out backwards',
  },

  '& > *:nth-of-type(1)': {
    animationDelay: '0.1s',
  },

  '& > *:nth-of-type(2)': {
    animationDelay: '0.2s',
  },

  '& > *:nth-of-type(3)': {
    animationDelay: '0.3s',
  },

  '@keyframes slideUp': {
    from: {
      opacity: 0,
      transform: 'translateY(20px)',
    },
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const ContentGrid = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: theme.spacing(3),

  '@media (max-width: 1200px)': {
    gridTemplateColumns: '1fr',
  },
}));

const LeftColumn = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const RightColumn = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const SectionTitle = styled.h3(({ theme }) => ({
  ...theme.typography.titleLarge,
  color: theme.colors.onSurface,
  margin: 0,
  marginBottom: theme.spacing(2),
}));

// Dashboard Component
function DashboardContent() {
  const { theme, toggleTheme } = useM3Theme();

  const graph = useMemo(
    () =>
      analyzer.buildGraph([
        { id: 'Input', dependencies: [] },
        { id: 'Symbolic', dependencies: ['Input'] },
        { id: 'Semantic', dependencies: ['Input'] },
        { id: 'Hybrid', dependencies: ['Symbolic', 'Semantic'] },
      ]),
    []
  );

  const feedbackMessages = useMemo(
    () =>
      mockResults.map((result) =>
        feedbackGenerator.generate(
          result.stepId,
          result.symbolic.valid,
          result.consensus.coherence,
          []
        )
      ),
    []
  );

  const summary = useMemo(() => {
    const aggregateLii =
      mockResults.reduce((acc, item) => acc + item.lii, 0) / (mockResults.length || 1);

    const aggregateCoherence =
      mockResults.reduce((acc, item) => acc + item.consensus.coherence, 0) /
      (mockResults.length || 1);

    const passCount = mockResults.filter((item) => item.pass).length;

    return {
      aggregateLii: Math.round(aggregateLii),
      aggregateCoherence: Math.round(aggregateCoherence),
      passRate: mockResults.length ? Math.round((passCount / mockResults.length) * 100) : 0,
    };
  }, []);

  // Timeline data
  const timelineItems: TimelineItem[] = [
    { title: 'Run Started', subtitle: '10:00 AM', icon: 'play_arrow' },
    { title: 'Step 1 Completed', subtitle: '10:00 AM', icon: 'check', status: 'success' },
    { title: 'Step 2 Completed', subtitle: '10:01 AM', icon: 'check', status: 'success' },
    { title: 'Step 3 Completed', subtitle: '10:02 AM', icon: 'check', status: 'success' },
    { title: 'Step 4 Completed', subtitle: '10:02 AM', icon: 'check', status: 'success' },
    { title: 'Step 5 Failed', subtitle: '10:03 AM', icon: 'error', status: 'error' },
    { title: 'Run Finished', subtitle: '10:03 AM', icon: 'stop' },
  ];

  // Table columns
  const columns = [
    { key: 'stepId', header: 'Step', width: '100px' },
    {
      key: 'symbolic.diagnostics',
      header: 'Description',
      render: (row: HybridStepResult) => row.symbolic.diagnostics,
    },
    {
      key: 'pass',
      header: 'Result',
      width: '120px',
      render: (row: HybridStepResult) => (
        <StatusBadge status={row.pass ? 'success' : 'error'}>
          {row.pass ? 'Success' : 'Failure'}
        </StatusBadge>
      ),
    },
    {
      key: 'lii',
      header: 'LII',
      width: '80px',
      render: (row: HybridStepResult) => `${row.lii}`,
    },
  ];

  return (
    <PageContainer>
      <Header>
        <LogoSection>
          <Logo>PB</Logo>
          <AppTitle>ProofBench</AppTitle>
        </LogoSection>
        <HeaderActions>
          <IconButton onClick={toggleTheme} aria-label="Toggle theme">
            <span className="material-symbols-outlined">
              {theme.mode === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </IconButton>
          <IconButton aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
          </IconButton>
        </HeaderActions>
      </Header>

      <Main>
        <ContentWrapper>
          <PageHeader>
            <PageTitle>Hybrid Reasoning Dashboard</PageTitle>
            <PageSubtitle>
              Monitor proof validation metrics, justification graphs, and feedback in real-time
            </PageSubtitle>
          </PageHeader>

          <MetricsGrid>
            <MetricCard
              label="LII"
              value={`0.${summary.aggregateLii}`}
              metricType="lii"
              numericValue={summary.aggregateLii}
              tooltip="Logical Inference Index - Overall proof quality score"
              icon="analytics"
            />
            <MetricCard
              label="Coherence"
              value={`0.${summary.aggregateCoherence}`}
              metricType="coherence"
              numericValue={summary.aggregateCoherence}
              tooltip="Multi-LLM consensus coherence score"
              icon="donut_small"
            />
            <MetricCard
              label="Pass Rate"
              value={`${summary.passRate}%`}
              tooltip="Percentage of steps passing validation"
              icon="task_alt"
            />
          </MetricsGrid>

          <ContentGrid>
            <LeftColumn>
              <div>
                <SectionTitle>Step Results</SectionTitle>
                <Table columns={columns} data={mockResults} hoverable />
              </div>

              <div>
                <SectionTitle>Justification Graph</SectionTitle>
                <JustificationGraphD3 graph={graph} height={400} />
              </div>

              <div>
                <SectionTitle>Feedback</SectionTitle>
                <AlertStack>
                  {feedbackMessages.slice(0, 2).map((msg, index) => (
                    <Alert key={index} severity={msg.type as any} title={msg.type.toUpperCase()}>
                      {msg.message}
                    </Alert>
                  ))}
                </AlertStack>
              </div>
            </LeftColumn>

            <RightColumn>
              <div>
                <SectionTitle>Run Log</SectionTitle>
                <Timeline items={timelineItems} />
              </div>
            </RightColumn>
          </ContentGrid>
        </ContentWrapper>
      </Main>
    </PageContainer>
  );
}

// Export wrapped with M3ThemeProvider
export function HybridDashboardM3Page() {
  return (
    <M3ThemeProvider initialMode="dark">
      <DashboardContent />
    </M3ThemeProvider>
  );
}
