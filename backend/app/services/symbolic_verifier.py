# [B] ProofBench Backend - Symbolic Verification Service
# SymPy-based equation verification

import asyncio
from typing import Dict, List, Optional
import sympy
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application


class BackendSymbolicVerifier:
    """
    Backend symbolic verification using SymPy.
    
    Verifies mathematical equations for symbolic correctness by parsing
    and comparing left-hand side (LHS) and right-hand side (RHS) expressions.
    """
    
    def __init__(self):
        """Initialize symbolic verifier with SymPy transformations"""
        # Standard transformations for parsing
        self.transformations = (
            standard_transformations + 
            (implicit_multiplication_application,)
        )
    
    async def verify_equation(self, lhs: str, rhs: str) -> bool:
        """
        Verify if two mathematical expressions are symbolically equivalent.
        
        Args:
            lhs: Left-hand side expression string
            rhs: Right-hand side expression string
        
        Returns:
            bool: True if expressions are symbolically equivalent
        
        Examples:
            >>> verifier = BackendSymbolicVerifier()
            >>> await verifier.verify_equation("x + 5", "5 + x")
            True
            >>> await verifier.verify_equation("2*x", "x*2")
            True
            >>> await verifier.verify_equation("x^2", "x*x")
            True
        """
        try:
            # Parse expressions
            lhs_expr = parse_expr(lhs, transformations=self.transformations)
            rhs_expr = parse_expr(rhs, transformations=self.transformations)
            
            # Simplify difference and check if zero
            difference = sympy.simplify(lhs_expr - rhs_expr)
            is_equal = difference == 0
            
            return bool(is_equal)
            
        except (sympy.SympifyError, ValueError, TypeError) as e:
            # Invalid syntax or unparseable expression
            print(f"[W] Equation parsing failed: {e}")
            return False
        except Exception as e:
            # Unexpected error
            print(f"[-] Symbolic verification error: {e}")
            return False
    
    async def verify_steps(self, steps: List) -> Dict:
        """
        Verify symbolic correctness of multiple proof steps.
        
        Args:
            steps: List of ProofStep entities with equations
        
        Returns:
            dict: Verification results with score and details
            {
                "score": float,  # 0-100 percentage of valid steps
                "details": [
                    {"step_id": int, "symbolically_valid": bool},
                    ...
                ]
            }
        """
        results = []
        valid_steps = 0
        
        for step in steps:
            step_valid = True
            
            # Check if step has an equation to verify
            if hasattr(step, 'equation') and step.equation:
                # Handle different equation formats
                if isinstance(step.equation, dict):
                    lhs = step.equation.get('lhs', '')
                    rhs = step.equation.get('rhs', '')
                elif isinstance(step.equation, str):
                    # Parse equation string (format: "lhs = rhs")
                    parts = step.equation.split('=')
                    if len(parts) == 2:
                        lhs, rhs = parts[0].strip(), parts[1].strip()
                    else:
                        # Invalid format, skip verification
                        lhs, rhs = '', ''
                else:
                    lhs, rhs = '', ''
                
                # Verify if both sides exist
                if lhs and rhs:
                    step_valid = await self.verify_equation(lhs, rhs)
                else:
                    # No equation to verify, consider valid
                    step_valid = True
            else:
                # No equation field, consider valid
                step_valid = True
            
            if step_valid:
                valid_steps += 1
            
            results.append({
                "step_id": step.id if hasattr(step, 'id') else None,
                "step_index": step.step_index if hasattr(step, 'step_index') else None,
                "symbolically_valid": step_valid
            })
        
        # Calculate percentage score
        score = (valid_steps / len(steps)) * 100 if steps else 100
        
        return {
            "score": round(score, 2),
            "valid_count": valid_steps,
            "total_count": len(steps),
            "details": results
        }
    
    async def parse_and_validate(self, expression: str) -> Optional[sympy.Expr]:
        """
        Parse and validate a mathematical expression.
        
        Args:
            expression: Mathematical expression string
        
        Returns:
            sympy.Expr: Parsed expression, or None if invalid
        """
        try:
            return parse_expr(expression, transformations=self.transformations)
        except Exception as e:
            print(f"[W] Expression validation failed: {e}")
            return None
    
    async def simplify_expression(self, expression: str) -> Optional[str]:
        """
        Simplify a mathematical expression.
        
        Args:
            expression: Mathematical expression string
        
        Returns:
            str: Simplified expression, or None if invalid
        """
        try:
            expr = parse_expr(expression, transformations=self.transformations)
            simplified = sympy.simplify(expr)
            return str(simplified)
        except Exception as e:
            print(f"[W] Expression simplification failed: {e}")
            return None


# [T] Future enhancements

# async def verify_with_assumptions(self, lhs: str, rhs: str, assumptions: Dict) -> bool:
#     """Verify equations with domain-specific assumptions (e.g., x > 0, x is integer)"""
#     pass
#
# async def verify_implication(self, premise: str, conclusion: str) -> bool:
#     """Verify if conclusion logically follows from premise"""
#     pass
#
# async def check_dimensional_consistency(self, expression: str, units: Dict) -> bool:
#     """Verify dimensional consistency in physics equations"""
#     pass
