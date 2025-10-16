/**
 * Step Results Panel Component
 * Displays hybrid verification results for each proof step
 */

import React from 'react';
import styled from '@emotion/styled';
import type { HybridStepResult } from '../core/hybrid_engine';

interface StepResultsPanelProps {
  results: HybridStepResult[];
}

const PanelContainer = styled.div({
  padding: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  marginTop: '16px'
});

const StepItem = styled.div<{ pass: boolean }>(({ pass }) => ({
  padding: '12px',
  marginBottom: '12px',
  borderLeft: `4px solid ${pass ? '#28a745' : '#dc3545'}`,
  backgroundColor: '#f9f9f9'
}));

export default function StepResultsPanel({ results }: StepResultsPanelProps) {
  return (
    <PanelContainer>
      <h3>Step Results</h3>
      {results.map((result) => (
        <StepItem key={result.stepId} pass={result.pass}>
          <div>
            <strong>Step {result.stepId}</strong>: {result.pass ? 'PASS' : 'FAIL'}
          </div>
          <div>LII: {result.lii} [{result.lci[0]}-{result.lci[1]}]</div>
          <div>Coherence: {result.consensus.coherence}</div>
          <div>Symbolic: {result.symbolic.valid ? 'Valid' : 'Invalid'}</div>
        </StepItem>
      ))}
    </PanelContainer>
  );
}
