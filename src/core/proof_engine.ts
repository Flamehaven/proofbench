/**
 * ProofBench Proof Engine
 * Orchestrates complete proof evaluation using hybrid reasoning
 */

import { HybridEngine, type ProofStep, type HybridStepResult } from './hybrid_engine';
import { LIIEngine } from '../metrics/lii_engine';
import { FeedbackGenerator, type FeedbackMessage } from './feedback_generator';

export interface ProofInput {
  steps: ProofStep[];
  domain?: 'algebra' | 'topology' | 'logic';
}

export interface ProofEvaluationResult {
  valid: boolean;
  lii: number;
  lci: [number, number];
  coherence: number;
  steps: HybridStepResult[];
  feedback: FeedbackMessage[];
}

export class ProofEngine {
  private hybrid: HybridEngine;
  private liiEngine: LIIEngine;
  private feedbackGen: FeedbackGenerator;

  constructor(pool: any, models?: string[]) {
    this.hybrid = new HybridEngine(pool, models);
    this.liiEngine = new LIIEngine();
    this.feedbackGen = new FeedbackGenerator();
  }

  async evaluate(proof: ProofInput): Promise<ProofEvaluationResult> {
    const results: HybridStepResult[] = [];
    const feedback: FeedbackMessage[] = [];

    // Evaluate each step
    for (const step of proof.steps) {
      const result = await this.hybrid.verifyStep(step);
      results.push(result);

      // Generate step-level feedback
      const stepFeedback = this.feedbackGen.generate(
        result.stepId,
        result.symbolic.valid,
        result.consensus.coherence,
        []
      );
      feedback.push(stepFeedback);
    }

    // Compute aggregate metrics
    const validSteps = results.filter(r => r.pass).length;
    const totalSteps = results.length;
    const errorCount = totalSteps - validSteps;

    const aggregateCoherence = totalSteps > 0
      ? results.reduce((sum, r) => sum + r.consensus.coherence, 0) / totalSteps
      : 0;

    const liiResult = this.liiEngine.analyze(
      proof.domain || 'algebra',
      totalSteps,
      errorCount,
      aggregateCoherence,
      0 // drift score
    );

    // Generate proof-level feedback
    const proofFeedback = this.feedbackGen.generateProofSummary(
      validSteps,
      totalSteps,
      liiResult.lii
    );
    feedback.push(proofFeedback);

    return {
      valid: liiResult.lii >= 80,
      lii: liiResult.lii,
      lci: liiResult.lci,
      coherence: Math.round(aggregateCoherence),
      steps: results,
      feedback
    };
  }
}
