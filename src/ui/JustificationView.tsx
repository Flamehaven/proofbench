/**
 * Justification View Component
 * Visualizes proof dependency graph
 */

import React from 'react';
import styled from '@emotion/styled';
import type { JustificationGraph } from '../core/justification_analyzer';

interface JustificationViewProps {
  graph: JustificationGraph;
}

const ViewContainer = styled.div({
  padding: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff'
});

export default function JustificationView({ graph }: JustificationViewProps) {
  return (
    <ViewContainer>
      <h3>Justification Graph</h3>
      <div>Nodes: {graph.nodes.length}</div>
      <div>Max Depth: {graph.depth}</div>
      <div>Has Cycle: {graph.hasCycle ? 'Yes (Invalid!)' : 'No'}</div>
      <ul>
        {graph.nodes.map((node) => (
          <li key={node.id}>
            {node.id} → [{node.dependencies.join(', ')}]
          </li>
        ))}
      </ul>
    </ViewContainer>
  );
}
