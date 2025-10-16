/**
 * ProofBench Justification Analyzer
 * Analyzes logical dependency graphs and detects cycles
 */

export interface JustificationNode {
  id: string;
  dependencies: string[];
}

export interface JustificationGraph {
  nodes: JustificationNode[];
  hasCycle: boolean;
  depth: number;
}

export class JustificationAnalyzer {
  buildGraph(nodes: JustificationNode[]): JustificationGraph {
    const hasCycle = this._detectCycle(nodes);
    const depth = this._computeMaxDepth(nodes);

    return {
      nodes,
      hasCycle,
      depth
    };
  }

  private _detectCycle(nodes: JustificationNode[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const adjList = this._buildAdjacencyList(nodes);

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = adjList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  private _computeMaxDepth(nodes: JustificationNode[]): number {
    const adjList = this._buildAdjacencyList(nodes);
    const memo = new Map<string, number>();

    const dfs = (nodeId: string): number => {
      if (memo.has(nodeId)) {
        return memo.get(nodeId)!;
      }

      const neighbors = adjList.get(nodeId) || [];
      if (neighbors.length === 0) {
        memo.set(nodeId, 1);
        return 1;
      }

      const maxChildDepth = Math.max(...neighbors.map(n => dfs(n)));
      const depth = maxChildDepth + 1;
      memo.set(nodeId, depth);
      return depth;
    };

    let maxDepth = 0;
    for (const node of nodes) {
      maxDepth = Math.max(maxDepth, dfs(node.id));
    }

    return maxDepth;
  }

  private _buildAdjacencyList(nodes: JustificationNode[]): Map<string, string[]> {
    const adjList = new Map<string, string[]>();

    for (const node of nodes) {
      adjList.set(node.id, node.dependencies);
    }

    return adjList;
  }
}
