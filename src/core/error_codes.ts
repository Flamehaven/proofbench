/**
 * ProofBench Error Codes - Standardized verification result codes
 * Based on 3.7.1 specification with TypeScript typing
 */

export const ERROR_CODES = {
  VALID: "A",               // Algebraically valid
  ALGEBRAIC_ERROR: "E",     // Algebraic mismatch
  INCOMPLETE: "I",          // Incomplete proof step
  DRIFT: "D",               // Semantic drift detected
  UNJUSTIFIED: "U",         // Unjustified logical leap
  RUNTIME_ERROR: "C"        // Computation crash/timeout
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface VerificationResult {
  code: ErrorCode;
  message?: string;
  diagnostics?: string;
}
