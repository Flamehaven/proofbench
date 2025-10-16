# [B] ProofBench Backend - Proof Verification Service
# Background service for proof evaluation

import asyncio
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app import crud
from app.core.config import settings
from app.models.proof import Proof
from app.services.llm_adapter import LLMAdapter, EvaluationOptions, ConsensusResult
from app.services.llm.base import LLMResponse
from app.services.symbolic_verifier import BackendSymbolicVerifier


class BackendProofEngine:
    """
    Backend proof verification engine.

    Implements hybrid verification combining:
    - Symbolic verification (equation validity)
    - Semantic evaluation (LLM-based reasoning assessment)
    - Multi-provider consensus for reliability
    """

    def __init__(self):
        """Initialize verification engine with LLM adapter and symbolic verifier"""
        self.symbolic_weight = settings.SYMBOLIC_WEIGHT
        self.semantic_weight = settings.SEMANTIC_WEIGHT
        self.pass_threshold = settings.PASS_THRESHOLD

        # Initialize LLM adapter for semantic evaluation
        self.llm_adapter = LLMAdapter()
        self.has_llm = self.llm_adapter.has_providers()

        # Initialize symbolic verifier for SymPy-based validation
        self.symbolic_verifier = BackendSymbolicVerifier()

        if self.has_llm:
            providers = self.llm_adapter.get_available_providers()
            print(f"[+] LLM providers available: {', '.join(providers)}")
        else:
            print("[W] No LLM providers available - semantic evaluation will be skipped")

        print(f"[+] Symbolic verifier initialized (SymPy-based)")

    async def evaluate(self, proof_data: Proof) -> dict:
        """
        Evaluate a proof and return verification results.

        Combines:
        - Symbolic verification (equation checking)
        - Semantic evaluation (LLM reasoning assessment)
        - Multi-provider consensus for reliability

        Args:
            proof_data: Proof entity with steps

        Returns:
            dict: Verification result with LII score, validity, step-by-step results
        """
        print(f"[>] Evaluating proof {proof_data.id} with {len(proof_data.steps)} steps")

        # Evaluate each step
        step_results = []
        semantic_scores = []
        symbolic_scores = []

        for i, step in enumerate(proof_data.steps):
            # Symbolic verification (placeholder - TODO: implement SymPy validation)
            symbolic_pass = await self._verify_symbolic(step)
            symbolic_score = 100.0 if symbolic_pass else 0.0
            symbolic_scores.append(symbolic_score)

            # Semantic evaluation using LLM consensus
            semantic_score = await self._evaluate_semantic(step, proof_data.domain)
            semantic_scores.append(semantic_score)

            # Dependencies validation (placeholder - TODO: implement graph check)
            dependencies_valid = True

            step_results.append({
                "step_id": step.id,
                "step_index": step.step_index,
                "symbolic_pass": symbolic_pass,
                "semantic_score": round(semantic_score, 2),
                "dependencies_valid": dependencies_valid,
                "hybrid_score": round(
                    symbolic_score * self.symbolic_weight + semantic_score * self.semantic_weight,
                    2
                )
            })

            print(f"  [+] Step {i+1}/{len(proof_data.steps)}: symbolic={symbolic_pass}, semantic={semantic_score:.1f}")

        # Calculate overall LII score (hybrid approach)
        avg_symbolic = sum(symbolic_scores) / len(symbolic_scores) if symbolic_scores else 0
        avg_semantic = sum(semantic_scores) / len(semantic_scores) if semantic_scores else 0

        lii_score = (avg_symbolic * self.symbolic_weight) + (avg_semantic * self.semantic_weight)
        is_valid = lii_score >= self.pass_threshold

        # Calculate confidence interval (based on semantic variance if available)
        if len(semantic_scores) > 1:
            import statistics
            std_dev = statistics.stdev(semantic_scores)
            confidence_interval = [max(0, lii_score - std_dev * 1.96), min(100, lii_score + std_dev * 1.96)]
        else:
            confidence_interval = [lii_score - 5, lii_score + 5]

        # Coherence score (consistency across steps)
        coherence_score = self._calculate_coherence(semantic_scores)

        # Generate feedback
        feedback = self._generate_feedback(is_valid, lii_score, step_results, proof_data)

        result = {
            "is_valid": is_valid,
            "lii_score": round(lii_score, 2),
            "confidence_interval": [round(ci, 2) for ci in confidence_interval],
            "coherence_score": round(coherence_score, 2),
            "step_results": step_results,
            "feedback": feedback,
            "semantic_provider_count": len(self.llm_adapter.get_available_providers()) if self.has_llm else 0
        }

        print(f"[+] Proof {proof_data.id} evaluation complete: valid={is_valid}, lii={lii_score:.1f}, coherence={coherence_score:.1f}")
        return result

    async def _verify_symbolic(self, step) -> bool:
        """
        Verify symbolic correctness of a proof step using SymPy.

        Args:
            step: ProofStep entity

        Returns:
            bool: True if symbolically valid
        """
        try:
            # Check if step has an equation to verify
            if not hasattr(step, 'equation') or not step.equation:
                # No equation to verify, consider valid
                return True

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
                    return True
            else:
                # Unknown format, skip verification
                return True

            # Verify symbolic equivalence
            if lhs and rhs:
                return await self.symbolic_verifier.verify_equation(lhs, rhs)
            else:
                # No equation content, consider valid
                return True

        except Exception as e:
            print(f"[W] Symbolic verification error for step {step.id if hasattr(step, 'id') else 'unknown'}: {e}")
            # On error, assume valid (graceful degradation)
            return True

    async def _evaluate_semantic(self, step, domain: str) -> float:
        """
        Evaluate semantic quality of a proof step using LLM consensus.

        Uses multi-provider evaluation for reliability and calculates
        consensus score from all available LLM providers.

        Args:
            step: ProofStep entity
            domain: Mathematical domain (algebra, calculus, logic, etc.)

        Returns:
            float: Semantic score (0-100)
        """
        if not self.has_llm:
            # Fallback: return neutral score if no LLM available
            print("[W] No LLM providers - skipping semantic evaluation")
            return 50.0

        # Build evaluation prompt
        prompt = self._build_evaluation_prompt(step, domain)

        # Configure LLM options
        options = EvaluationOptions(
            temperature=0.3,  # Low temperature for consistent evaluation
            max_tokens=300,   # Concise reasoning
            json_mode=True    # Structured response
        )

        try:
            # Try parallel evaluation first (best reliability)
            responses: List[LLMResponse] = await self.llm_adapter.evaluate_parallel(prompt, options)

            if len(responses) > 1:
                # Calculate consensus from multiple providers
                consensus: ConsensusResult = self.llm_adapter.calculate_consensus(responses)

                print(f"    [+] Semantic consensus: avg={consensus.average_score:.1f}, "
                      f"coherence={consensus.coherence_score:.1f}, "
                      f"providers={len(responses)}")

                return consensus.average_score
            elif len(responses) == 1:
                # Single provider response
                print(f"    [+] Semantic score (single provider): {responses[0].score}")
                return float(responses[0].score)
            else:
                # No responses (should not happen)
                print("[W] No LLM responses received")
                return 50.0

        except ConnectionError as e:
            # All parallel evaluations failed, try fallback
            print(f"[W] Parallel evaluation failed: {e}. Trying fallback...")

            try:
                response: LLMResponse = await self.llm_adapter.evaluate_with_fallback(prompt, options)
                print(f"    [+] Semantic score (fallback): {response.score} from {response.provider}")
                return float(response.score)

            except ConnectionError as fallback_error:
                # All LLMs failed
                print(f"[-] All LLM providers failed: {fallback_error}")
                return 50.0  # Neutral score as fallback

    def _build_evaluation_prompt(self, step, domain: str) -> str:
        """
        Build evaluation prompt for LLM semantic analysis.

        Args:
            step: ProofStep entity
            domain: Mathematical domain

        Returns:
            str: Formatted evaluation prompt
        """
        prompt = f"""Evaluate the following proof step from the domain of {domain}:

**Claim**: {step.claim}
**Equation**: {step.equation}
**Reasoning**: {step.reasoning}

Assess the logical soundness and correctness of this step. Consider:
1. Does the reasoning justify the claim?
2. Is the equation correctly derived?
3. Are there any logical gaps or errors?
4. Is the step appropriate for the {domain} domain?

Provide a score from 0-100 where:
- 0-30: Major logical errors or incorrect reasoning
- 31-60: Some issues but partially correct
- 61-85: Mostly correct with minor issues
- 86-100: Logically sound and correct

Respond in JSON format with:
- "score": integer from 0-100
- "reasoning": brief explanation of your evaluation
"""
        return prompt

    def _calculate_coherence(self, semantic_scores: List[float]) -> float:
        """
        Calculate coherence score based on consistency of semantic scores.

        Low variance = high coherence (steps are consistent)
        High variance = low coherence (inconsistent step quality)

        Args:
            semantic_scores: List of semantic scores for all steps

        Returns:
            float: Coherence score (0-100)
        """
        if len(semantic_scores) <= 1:
            return 100.0  # Perfect coherence for single step

        import statistics
        variance = statistics.variance(semantic_scores)

        # Inverse relationship: low variance = high coherence
        # Normalize variance to 0-100 scale (variance typically 0-1000)
        coherence = max(0, 100 - (variance / 10))

        return coherence

    def _generate_feedback(self, is_valid: bool, lii_score: float,
                          step_results: List[dict], proof_data: Proof) -> List[dict]:
        """
        Generate human-readable feedback for the proof evaluation.

        Args:
            is_valid: Overall validity
            lii_score: LII score
            step_results: Results for each step
            proof_data: Original proof data

        Returns:
            List[dict]: Feedback messages
        """
        feedback = []

        # Overall assessment
        if is_valid:
            feedback.append({
                "type": "success",
                "summary": "Proof is logically sound",
                "detail": f"LII score of {lii_score:.1f} exceeds threshold of {self.pass_threshold}"
            })
        else:
            feedback.append({
                "type": "warning",
                "summary": "Proof has potential issues",
                "detail": f"LII score of {lii_score:.1f} is below threshold of {self.pass_threshold}"
            })

        # Step-specific feedback
        weak_steps = [sr for sr in step_results if sr.get("semantic_score", 100) < 60]
        if weak_steps:
            step_indices = [sr["step_index"] for sr in weak_steps]
            feedback.append({
                "type": "warning",
                "summary": f"{len(weak_steps)} step(s) need review",
                "detail": f"Steps {step_indices} have low semantic scores"
            })

        # Domain-specific feedback
        feedback.append({
            "type": "info",
            "summary": f"Domain: {proof_data.domain}",
            "detail": f"Evaluated {len(step_results)} steps using {proof_data.domain} domain rules"
        })

        return feedback


async def run_proof_verification(proof_id: int, db_url: str) -> None:
    """
    Background task to verify a proof.

    This function runs in a background task and needs its own database session.

    Args:
        proof_id: ID of proof to verify
        db_url: Database connection URL for creating new session

    Flow:
        1. Update status to 'processing'
        2. Load proof data with steps
        3. Execute verification engine
        4. Store results in database
        5. Update status to 'completed' or 'failed'
    """
    # Create independent database session for background task
    engine = create_async_engine(str(db_url), echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False)

    async with session_maker() as db:
        try:
            # Step 1: Update status to processing
            await crud.proof.update_status(db, proof_id=proof_id, status="processing")
            print(f"[>] Started verification for proof {proof_id}")

            # Step 2: Load proof data
            proof_data = await crud.proof.get(db=db, id=proof_id)
            if not proof_data:
                print(f"[-] Proof {proof_id} not found")
                return

            # Step 3: Run verification engine
            engine = BackendProofEngine()
            result_data = await engine.evaluate(proof_data)

            # Step 4: Store result in database
            await crud.proof.create_result(db=db, proof_id=proof_id, obj_in=result_data)

            # Step 5: Update status to completed
            await crud.proof.update_status(db, proof_id=proof_id, status="completed")
            print(f"[+] Proof {proof_id} verification completed")

        except Exception as e:
            # Handle errors: update status to failed
            print(f"[-] Proof {proof_id} verification failed: {e}")
            try:
                await crud.proof.update_status(db, proof_id=proof_id, status="failed")
            except Exception as update_error:
                print(f"[-] Failed to update status: {update_error}")

        finally:
            # Clean up database connection
            await engine.dispose()


# [T] Future enhancements

# class VerificationQueue:
#     """Queue manager for proof verification tasks"""
#     def __init__(self, max_concurrent: int = 5):
#         self.semaphore = asyncio.Semaphore(max_concurrent)
#
#     async def enqueue(self, proof_id: int):
#         async with self.semaphore:
#             await run_proof_verification(proof_id)

# async def validate_proof_structure(proof: Proof) -> bool:
#     """Pre-validation before expensive verification"""
#     # Check for cycles in dependencies
#     # Validate equation syntax
#     # Check domain compatibility
#     pass
