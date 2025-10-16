/**
 * ProofBench Feedback Generator
 * Generates natural language feedback for proof validation
 */

export interface FeedbackMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  stepId: string | number;
  summary: string;
  suggestions?: string[];
}

export class FeedbackGenerator {
  generate(
    stepId: string | number,
    symbolicValid: boolean,
    coherence: number,
    errors: string[] = []
  ): FeedbackMessage {
    if (symbolicValid && coherence >= 80) {
      return {
        type: 'success',
        stepId,
        summary: `Step ${stepId}: Valid algebraic transformation with high semantic coherence`,
        suggestions: []
      };
    }

    if (!symbolicValid) {
      return {
        type: 'error',
        stepId,
        summary: `Step ${stepId}: Symbolic verification failed`,
        suggestions: [
          'Check algebraic manipulation for errors',
          'Verify variable substitutions',
          'Ensure proper use of mathematical properties'
        ]
      };
    }

    if (coherence < 70) {
      return {
        type: 'warning',
        stepId,
        summary: `Step ${stepId}: Low semantic coherence detected`,
        suggestions: [
          'Add justification for logical leap',
          'Clarify reasoning steps',
          'Provide intermediate calculations'
        ]
      };
    }

    return {
      type: 'info',
      stepId,
      summary: `Step ${stepId}: Acceptable but could be improved`,
      suggestions: [
        'Consider adding more detail',
        'Strengthen logical connections'
      ]
    };
  }

  generateProofSummary(
    validSteps: number,
    totalSteps: number,
    lii: number
  ): FeedbackMessage {
    const passRate = totalSteps > 0 ? (validSteps / totalSteps) * 100 : 0;

    if (passRate === 100 && lii >= 90) {
      return {
        type: 'success',
        stepId: 'summary',
        summary: `Proof complete: All ${totalSteps} steps validated (LII: ${lii})`,
        suggestions: []
      };
    }

    if (passRate >= 80) {
      return {
        type: 'warning',
        stepId: 'summary',
        summary: `Proof mostly valid: ${validSteps}/${totalSteps} steps passed (LII: ${lii})`,
        suggestions: ['Review failed steps for corrections']
      };
    }

    return {
      type: 'error',
      stepId: 'summary',
      summary: `Proof incomplete: Only ${validSteps}/${totalSteps} steps validated (LII: ${lii})`,
      suggestions: [
        'Significant revisions needed',
        'Review symbolic and semantic errors',
        'Consider restructuring proof approach'
      ]
    };
  }
}
