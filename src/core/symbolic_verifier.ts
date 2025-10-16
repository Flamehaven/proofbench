/**
 * ProofBench Symbolic Verifier
 * Performs algebraic verification using Pyodide/SymPy
 */

import { sanitizeExpr } from '../utils/sanitize';
import { ERROR_CODES, type ErrorCode } from './error_codes';

export interface SymbolicVerificationInput {
  lhs: string;
  rhs: string;
}

export interface SymbolicVerificationResult {
  valid: boolean;
  code?: ErrorCode;
  difference?: string;
  diagnostics?: string;
}

export class SymbolicVerifier {
  private pool: any; // PyodidePool type (Web Worker)

  constructor(pool: any) {
    this.pool = pool;
  }

  async verify(
    equation: SymbolicVerificationInput,
    domain: 'algebra' | 'topology' | 'logic' = 'algebra'
  ): Promise<SymbolicVerificationResult> {
    if (!equation?.lhs || !equation?.rhs) {
      return {
        valid: false,
        code: ERROR_CODES.INCOMPLETE,
        diagnostics: 'Missing LHS or RHS'
      };
    }

    try {
      const lhs = sanitizeExpr(equation.lhs);
      const rhs = sanitizeExpr(equation.rhs);
      const domainLib = this._domainImport(domain);

      const code = `
from sympy import simplify, symbols
from sympy.parsing.sympy_parser import parse_expr
${domainLib}
lhs = parse_expr("${lhs}")
rhs = parse_expr("${rhs}")
difference = simplify(lhs - rhs)
str(difference)
`;

      const result = await this.pool.runTask(code);
      const isValid = result === '0' || result === 0;

      return {
        valid: isValid,
        code: isValid ? ERROR_CODES.VALID : ERROR_CODES.ALGEBRAIC_ERROR,
        difference: isValid ? undefined : String(result),
        diagnostics: domain
      };
    } catch (error) {
      return {
        valid: false,
        code: ERROR_CODES.RUNTIME_ERROR,
        diagnostics: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private _domainImport(domain: string): string {
    switch (domain) {
      case 'topology':
        return 'from sympy.topology import PointSet';
      case 'logic':
        return 'from sympy.logic.boolalg import Implies, And, Or, Not';
      case 'algebra':
      default:
        return '';
    }
  }
}
