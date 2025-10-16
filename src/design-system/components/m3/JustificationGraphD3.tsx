/**
 * Material Design 3 Justification Graph Component
 * Interactive D3.js force-directed graph with M3 styling
 */

import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';
import { useM3Theme } from '../../themes/M3ThemeProvider';
import type { JustificationGraph } from '../../../core/justification_analyzer';

interface JustificationGraphD3Props {
  graph: JustificationGraph;
  width?: number;
  height?: number;
}

const GraphContainer = styled.div(({ theme }) => ({
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.lg,
  overflow: 'hidden',
  position: 'relative',
}));

const SvgContainer = styled.svg(({ theme }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
}));

const Controls = styled.div(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  zIndex: 10,
}));

const ControlButton = styled.button(({ theme }) => ({
  width: '32px',
  height: '32px',
  borderRadius: theme.borderRadius.full,
  border: 'none',
  backgroundColor: theme.colors.surfaceContainerHigh,
  color: theme.colors.onSurfaceVariant,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${theme.transitions.duration.shorter} ${theme.transitions.easing.easeInOut}`,

  '&:hover': {
    backgroundColor: theme.colors.surfaceContainerHighest,
    color: theme.colors.onSurface,
  },

  '& .material-symbols-outlined': {
    fontFamily: 'Material Symbols Outlined',
    fontSize: '18px',
  },
}));

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  dependencies: string[];
  isValid?: boolean;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

export const JustificationGraphD3: React.FC<JustificationGraphD3Props> = ({
  graph,
  width = 800,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useM3Theme();

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Convert graph data to D3 format
    const nodes: D3Node[] = graph.nodes.map((node) => ({
      id: node.id,
      dependencies: node.dependencies,
      isValid: !graph.hasCycle, // Simplified validation
    }));

    const links: D3Link[] = [];
    graph.nodes.forEach((node) => {
      node.dependencies.forEach((dep) => {
        links.push({
          source: dep,
          target: node.id,
        });
      });
    });

    // Setup SVG
    const svg = d3.select(svgRef.current);
    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Arrow markers for directed edges
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', theme.colors.outline);

    // Links
    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', theme.colors.outline)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Nodes
    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Node circles
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) =>
        d.isValid ? theme.colors.successContainer : theme.colors.errorContainer
      )
      .attr('stroke', (d) =>
        d.isValid ? theme.colors.success : theme.colors.error
      )
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 35)
          .attr('stroke-width', 3);
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 30)
          .attr('stroke-width', 2);
      });

    // Node labels
    node
      .append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', (d) =>
        d.isValid
          ? theme.colors.onSuccessContainer
          : theme.colors.onErrorContainer
      )
      .attr('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x!)
        .attr('y1', (d) => (d.source as D3Node).y!)
        .attr('x2', (d) => (d.target as D3Node).x!)
        .attr('y2', (d) => (d.target as D3Node).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Add control buttons functionality
    const zoomIn = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    };

    const zoomOut = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    };

    const resetZoom = () => {
      svg
        .transition()
        .duration(300)
        .call(zoom.transform, d3.zoomIdentity);
    };

    // Store functions for cleanup
    (svgRef.current as any).zoomIn = zoomIn;
    (svgRef.current as any).zoomOut = zoomOut;
    (svgRef.current as any).resetZoom = resetZoom;

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [graph, theme, width, height]);

  const handleZoomIn = () => {
    (svgRef.current as any)?.zoomIn?.();
  };

  const handleZoomOut = () => {
    (svgRef.current as any)?.zoomOut?.();
  };

  const handleResetZoom = () => {
    (svgRef.current as any)?.resetZoom?.();
  };

  return (
    <GraphContainer>
      <SvgContainer ref={svgRef} width={width} height={height} />
      <Controls>
        <ControlButton onClick={handleZoomIn} aria-label="Zoom in" title="Zoom in">
          <span className="material-symbols-outlined">add</span>
        </ControlButton>
        <ControlButton onClick={handleZoomOut} aria-label="Zoom out" title="Zoom out">
          <span className="material-symbols-outlined">remove</span>
        </ControlButton>
        <ControlButton onClick={handleResetZoom} aria-label="Reset zoom" title="Reset zoom">
          <span className="material-symbols-outlined">fit_screen</span>
        </ControlButton>
      </Controls>
    </GraphContainer>
  );
};
