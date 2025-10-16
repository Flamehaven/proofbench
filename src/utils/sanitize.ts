/**
 * ProofBench Sanitization Utilities
 * Ensures safe input processing for symbolic verification
 */

const ALLOWED_CHARS = /^[a-zA-Z0-9\+\-\*\/\^\(\)\s=\.,_]+$/;
const MAX_LENGTH = 500;

export function sanitizeExpr(expr: string): string {
  if (!expr || typeof expr !== 'string') {
    throw new Error('Invalid expression: must be non-empty string');
  }

  const trimmed = expr.trim();

  if (trimmed.length === 0) {
    throw new Error('Invalid expression: empty after trimming');
  }

  if (trimmed.length > MAX_LENGTH) {
    throw new Error(`Expression too long: max ${MAX_LENGTH} characters`);
  }

  if (!ALLOWED_CHARS.test(trimmed)) {
    throw new Error('Invalid characters in expression');
  }

  // Remove potential injection patterns
  const dangerous = ['eval', 'exec', 'import', '__', 'subprocess'];
  for (const pattern of dangerous) {
    if (trimmed.toLowerCase().includes(pattern)) {
      throw new Error(`Disallowed pattern detected: ${pattern}`);
    }
  }

  return trimmed;
}

export function sanitizeStepClaim(claim: string): string {
  if (!claim || typeof claim !== 'string') {
    return '';
  }

  return claim.trim().slice(0, 1000); // Max 1000 chars for natural language
}
