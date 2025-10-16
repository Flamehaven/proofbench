/**
 * ProofBench Semantic Evaluator
 * Wraps consensus manager for proof step semantic analysis
 */

import { ConsensusManager, type ConsensusResult } from '../ai/consensus_manager';

export interface SemanticEvaluationResult {
  consensus: ConsensusResult;
  pass: boolean;
}

const COHERENCE_THRESHOLD = 70;

export class SemanticEvaluator {
  private consensus: ConsensusManager;

  constructor(models?: string[]) {
    this.consensus = new ConsensusManager(models);
  }

  async evaluate(stepClaim: string): Promise<SemanticEvaluationResult> {
    const consensus = await this.consensus.evaluate(stepClaim);
    const pass = consensus.mean >= 70 && consensus.coherence >= COHERENCE_THRESHOLD;

    return {
      consensus,
      pass
    };
  }
}
