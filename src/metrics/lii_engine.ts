/**
 * ProofBench LII Engine (Logic Integrity Index)
 * Computes proof quality metrics with confidence intervals
 */

export interface LIIResult {
  lii: number;           // Logic Integrity Index (0-100)
  lci: [number, number]; // 95% Confidence Interval
}

const ERROR_PENALTY = 5;
const DRIFT_PENALTY = 10;
const DOMAIN_FACTORS: Record<string, number> = {
  algebra: 1.0,
  topology: 0.9,
  logic: 0.95
};

export class LIIEngine {
  /**
   * Compute Logic Integrity Index
   * @param domain - Proof domain (algebra, topology, logic)
   * @param totalSteps - Total number of proof steps
   * @param errorCount - Number of failed steps
   * @param driftScore - Semantic drift score (0-1)
   */
  computeLII(
    domain: string,
    totalSteps: number,
    errorCount: number,
    driftScore: number = 0
  ): number {
    const base = 100 - (errorCount * ERROR_PENALTY) - (driftScore * DRIFT_PENALTY);
    const factor = DOMAIN_FACTORS[domain] || 0.9;
    const lii = Math.round(base * factor);

    // Clamp to [0, 100]
    return Math.max(0, Math.min(100, lii));
  }

  /**
   * Compute LII Confidence Interval based on coherence
   * @param lii - Logic Integrity Index
   * @param coherence - Semantic coherence score (0-100)
   */
  computeLCI(lii: number, coherence: number): [number, number] {
    // Margin inversely proportional to coherence
    // Low coherence = wide interval
    const margin = Math.round((100 - coherence) / 5);

    const lciMin = Math.max(0, lii - margin);
    const lciMax = Math.min(100, lii + margin);

    return [lciMin, lciMax];
  }

  /**
   * Complete LII analysis with confidence interval
   */
  analyze(
    domain: string,
    totalSteps: number,
    errorCount: number,
    coherence: number,
    driftScore: number = 0
  ): LIIResult {
    const lii = this.computeLII(domain, totalSteps, errorCount, driftScore);
    const lci = this.computeLCI(lii, coherence);

    return { lii, lci };
  }
}
