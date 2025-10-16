# [B] ProofBench Backend - Verification Service Tests
# Unit tests for proof verification engine

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.verification import BackendProofEngine
from app.services.llm.base import LLMResponse
from app.models.proof import Proof, ProofStep


@pytest.mark.asyncio
class TestBackendProofEngine:
    """Test suite for backend proof verification engine"""

    @pytest.fixture
    def engine(self):
        """Create engine instance for tests"""
        return BackendProofEngine()

    @pytest.fixture
    def mock_proof_single_step(self):
        """Create a mock proof with single step"""
        proof = MagicMock(spec=Proof)
        proof.id = 1
        proof.domain = "algebra"

        step = MagicMock(spec=ProofStep)
        step.id = 1
        step.step_index = 0
        step.claim = "Addition is commutative"
        step.equation = {"lhs": "x + 2", "rhs": "2 + x"}
        step.reasoning = "By commutative property"

        proof.steps = [step]
        return proof

    @pytest.fixture
    def mock_proof_multi_step(self):
        """Create a mock proof with multiple steps"""
        proof = MagicMock(spec=Proof)
        proof.id = 2
        proof.domain = "algebra"

        step1 = MagicMock(spec=ProofStep)
        step1.id = 1
        step1.step_index = 0
        step1.claim = "Distributive property"
        step1.equation = {"lhs": "2*(x+3)", "rhs": "2*x+6"}
        step1.reasoning = "Apply distributive property"

        step2 = MagicMock(spec=ProofStep)
        step2.id = 2
        step2.step_index = 1
        step2.claim = "Simplification"
        step2.equation = {"lhs": "2*x+6", "rhs": "2*x+6"}
        step2.reasoning = "Identity"

        proof.steps = [step1, step2]
        return proof

    async def test_engine_initialization(self, engine):
        """Test engine initializes with correct settings"""
        # Assert
        assert engine.symbolic_weight == 0.7
        assert engine.semantic_weight == 0.3
        assert engine.pass_threshold == 70.0
        assert engine.symbolic_verifier is not None
        assert engine.llm_adapter is not None

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    @patch('app.services.verification.LLMAdapter.evaluate_parallel')
    async def test_evaluate_single_step_valid(
        self,
        mock_llm_eval,
        mock_symbolic_verify,
        engine,
        mock_proof_single_step
    ):
        """Test evaluation of valid single-step proof"""
        # Arrange
        mock_symbolic_verify.return_value = True

        mock_llm_response = MagicMock(spec=LLMResponse)
        mock_llm_response.score = 90
        mock_llm_response.provider = "openai"
        mock_llm_eval.return_value = [mock_llm_response]

        # Act
        result = await engine.evaluate(mock_proof_single_step)

        # Assert
        assert result["is_valid"] is True
        assert result["lii_score"] >= 70.0
        assert len(result["step_results"]) == 1
        assert result["step_results"][0]["symbolic_pass"] is True
        assert result["feedback"] is not None

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    @patch('app.services.verification.LLMAdapter.evaluate_parallel')
    async def test_evaluate_single_step_invalid(
        self,
        mock_llm_eval,
        mock_symbolic_verify,
        engine,
        mock_proof_single_step
    ):
        """Test evaluation of invalid single-step proof"""
        # Arrange
        mock_symbolic_verify.return_value = False

        mock_llm_response = MagicMock(spec=LLMResponse)
        mock_llm_response.score = 30
        mock_llm_response.provider = "openai"
        mock_llm_eval.return_value = [mock_llm_response]

        # Act
        result = await engine.evaluate(mock_proof_single_step)

        # Assert
        assert result["is_valid"] is False
        assert result["lii_score"] < 70.0
        assert result["step_results"][0]["symbolic_pass"] is False

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    @patch('app.services.verification.LLMAdapter.evaluate_parallel')
    async def test_evaluate_multi_step_proof(
        self,
        mock_llm_eval,
        mock_symbolic_verify,
        engine,
        mock_proof_multi_step
    ):
        """Test evaluation of multi-step proof"""
        # Arrange
        mock_symbolic_verify.return_value = True

        mock_llm_response = MagicMock(spec=LLMResponse)
        mock_llm_response.score = 85
        mock_llm_response.provider = "openai"
        mock_llm_eval.return_value = [mock_llm_response]

        # Act
        result = await engine.evaluate(mock_proof_multi_step)

        # Assert
        assert len(result["step_results"]) == 2
        assert result["is_valid"] is True
        assert "coherence_score" in result
        assert "confidence_interval" in result

    async def test_calculate_coherence_single_step(self, engine):
        """Test coherence calculation for single step"""
        # Act
        coherence = engine._calculate_coherence([85.0])

        # Assert
        assert coherence == 100.0

    async def test_calculate_coherence_consistent_steps(self, engine):
        """Test coherence for consistent step scores"""
        # Act
        coherence = engine._calculate_coherence([85.0, 87.0, 86.0, 88.0])

        # Assert
        assert coherence > 95.0  # Low variance = high coherence

    async def test_calculate_coherence_inconsistent_steps(self, engine):
        """Test coherence for inconsistent step scores"""
        # Act
        coherence = engine._calculate_coherence([90.0, 50.0, 85.0, 30.0])

        # Assert
        assert coherence < 70.0  # High variance = low coherence

    async def test_build_evaluation_prompt(self, engine):
        """Test evaluation prompt construction"""
        # Arrange
        step = MagicMock()
        step.claim = "Test claim"
        step.equation = {"lhs": "a", "rhs": "b"}
        step.reasoning = "Test reasoning"

        # Act
        prompt = engine._build_evaluation_prompt(step, "algebra")

        # Assert
        assert "Test claim" in prompt
        assert "Test reasoning" in prompt
        assert "algebra" in prompt
        assert "0-100" in prompt

    async def test_generate_feedback_valid_proof(self, engine):
        """Test feedback generation for valid proof"""
        # Arrange
        step_results = [
            {"step_id": 1, "step_index": 0, "semantic_score": 90.0}
        ]
        mock_proof = MagicMock()
        mock_proof.domain = "algebra"
        mock_proof.steps = [MagicMock()]

        # Act
        feedback = engine._generate_feedback(True, 85.0, step_results, mock_proof)

        # Assert
        assert len(feedback) > 0
        assert any(f["type"] == "success" for f in feedback)

    async def test_generate_feedback_invalid_proof(self, engine):
        """Test feedback generation for invalid proof"""
        # Arrange
        step_results = [
            {"step_id": 1, "step_index": 0, "semantic_score": 50.0}
        ]
        mock_proof = MagicMock()
        mock_proof.domain = "algebra"
        mock_proof.steps = [MagicMock()]

        # Act
        feedback = engine._generate_feedback(False, 55.0, step_results, mock_proof)

        # Assert
        assert len(feedback) > 0
        assert any(f["type"] == "warning" for f in feedback)

    async def test_generate_feedback_weak_steps(self, engine):
        """Test feedback includes warning for weak steps"""
        # Arrange
        step_results = [
            {"step_id": 1, "step_index": 0, "semantic_score": 90.0},
            {"step_id": 2, "step_index": 1, "semantic_score": 50.0},
            {"step_id": 3, "step_index": 2, "semantic_score": 45.0}
        ]
        mock_proof = MagicMock()
        mock_proof.domain = "algebra"
        mock_proof.steps = [MagicMock(), MagicMock(), MagicMock()]

        # Act
        feedback = engine._generate_feedback(True, 75.0, step_results, mock_proof)

        # Assert
        weak_step_warnings = [f for f in feedback if "need review" in f.get("summary", "")]
        assert len(weak_step_warnings) > 0

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    async def test_verify_symbolic_dict_equation(self, mock_verify, engine):
        """Test symbolic verification with dict equation format"""
        # Arrange
        mock_verify.return_value = True
        step = MagicMock()
        step.id = 1
        step.equation = {"lhs": "x+1", "rhs": "1+x"}

        # Act
        result = await engine._verify_symbolic(step)

        # Assert
        assert result is True
        mock_verify.assert_called_once_with("x+1", "1+x")

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    async def test_verify_symbolic_string_equation(self, mock_verify, engine):
        """Test symbolic verification with string equation format"""
        # Arrange
        mock_verify.return_value = True
        step = MagicMock()
        step.id = 1
        step.equation = "x+1 = 1+x"

        # Act
        result = await engine._verify_symbolic(step)

        # Assert
        assert result is True

    async def test_verify_symbolic_no_equation(self, engine):
        """Test symbolic verification with no equation"""
        # Arrange
        step = MagicMock()
        step.id = 1
        step.equation = None

        # Act
        result = await engine._verify_symbolic(step)

        # Assert
        assert result is True  # No equation = valid by default

    @patch('app.services.verification.BackendSymbolicVerifier.verify_equation')
    async def test_verify_symbolic_error_handling(self, mock_verify, engine):
        """Test symbolic verification handles errors gracefully"""
        # Arrange
        mock_verify.side_effect = Exception("Verification error")
        step = MagicMock()
        step.id = 1
        step.equation = {"lhs": "invalid", "rhs": "syntax"}

        # Act
        result = await engine._verify_symbolic(step)

        # Assert - Should return True on error (graceful degradation)
        assert result is True
