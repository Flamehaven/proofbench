/**
 * ProofBench Hybrid Engine
 * Combines symbolic verification and semantic evaluation
 */

import { SymbolicVerifier, type SymbolicVerificationResult } from './symbolic_verifier';
import { SemanticEvaluator, type SemanticEvaluationResult } from './semantic_evaluator';
import { LIIEngine } from '../metrics/lii_engine';
import type { ConsensusResult } from '../ai/consensus_manager';

export interface ProofStep {
  id: string | number;
  equation?: {
    lhs: string;
    rhs: string;
  };
  claim?: string;
  domain?: 'algebra' | 'topology' | 'logic';
}

export interface HybridStepResult {
  stepId: string | number;
  symbolic: SymbolicVerificationResult | { valid: boolean };
  consensus: ConsensusResult;
  lii: number;
  lci: [number, number];
  pass: boolean;
}

const SYMBOLIC_WEIGHT = 0.7;
const SEMANTIC_WEIGHT = 0.3;
const PASS_THRESHOLD = 70;

export class HybridEngine {
  private symbolic: SymbolicVerifier;
  private semantic: SemanticEvaluator;
  private liiEngine: LIIEngine;

  constructor(pool: any, models?: string[]) {
    this.symbolic = new SymbolicVerifier(pool);
    this.semantic = new SemanticEvaluator(models);
    this.liiEngine = new LIIEngine();
  }

  async verifyStep(step: ProofStep): Promise<HybridStepResult> {
    // Symbolic verification (if equation provided)
    const symbolicResult = step.equation
      ? await this.symbolic.verify(step.equation, step.domain)
      : { valid: true }; // No equation = narrative step

    // Semantic evaluation (always performed)
    const semanticResult = await this.semantic.evaluate(step.claim || '');

    // Combined scoring
    const symbolicScore = symbolicResult.valid ? 100 : 0;
    const semanticScore = semanticResult.consensus.mean;
    const combinedScore =
      SYMBOLIC_WEIGHT * symbolicScore +
      SEMANTIC_WEIGHT * semanticScore;

    // LII calculation
    const errorCount = symbolicResult.valid ? 0 : 1;
    const liiResult = this.liiEngine.analyze(
      step.domain || 'algebra',
      1, // single step
      errorCount,
      semanticResult.consensus.coherence,
      0 // drift score (computed at proof level)
    );

    // Pass criteria: combined score > threshold AND coherence adequate
    const pass = combinedScore >= PASS_THRESHOLD &&
                 semanticResult.consensus.coherence >= 70;

    return {
      stepId: step.id,
      symbolic: symbolicResult,
      consensus: semanticResult.consensus,
      lii: liiResult.lii,
      lci: liiResult.lci,
      pass
    };
  }
}
