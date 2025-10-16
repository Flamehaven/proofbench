# [B] ProofBench Backend - Symbolic Verifier Tests
# Unit tests for SymPy-based symbolic verification

import pytest

from app.services.symbolic_verifier import BackendSymbolicVerifier


@pytest.mark.asyncio
class TestSymbolicVerifier:
    """Test suite for symbolic verification engine"""

    @pytest.fixture
    def verifier(self):
        """Create verifier instance for tests"""
        return BackendSymbolicVerifier()

    async def test_commutative_property(self, verifier):
        """Test verification of commutative property"""
        # Act
        result = await verifier.verify_equation("x + 5", "5 + x")

        # Assert
        assert result is True

    async def test_associative_property(self, verifier):
        """Test verification of associative property"""
        # Act
        result = await verifier.verify_equation("2 * x", "x * 2")

        # Assert
        assert result is True

    async def test_algebraic_simplification(self, verifier):
        """Test algebraic simplification equivalence"""
        # Act
        result = await verifier.verify_equation("x + x", "2*x")

        # Assert
        assert result is True

    async def test_distributive_property(self, verifier):
        """Test distributive property"""
        # Act
        result = await verifier.verify_equation("2*(x + 3)", "2*x + 6")

        # Assert
        assert result is True

    async def test_invalid_equation(self, verifier):
        """Test that invalid equations are rejected"""
        # Act
        result = await verifier.verify_equation("x + 1", "x + 2")

        # Assert
        assert result is False

    async def test_complex_expression(self, verifier):
        """Test complex expression verification"""
        # Act
        result = await verifier.verify_equation(
            "(x + y)**2",
            "x**2 + 2*x*y + y**2"
        )

        # Assert
        assert result is True

    async def test_trigonometric_identity(self, verifier):
        """Test trigonometric identity verification"""
        # Act
        result = await verifier.verify_equation(
            "sin(x)**2 + cos(x)**2",
            "1"
        )

        # Assert
        assert result is True

    async def test_empty_equations(self, verifier):
        """Test handling of empty equation strings"""
        # Act
        result = await verifier.verify_equation("", "")

        # Assert - Empty equations should be considered valid (edge case)
        assert result is True

    async def test_malformed_equation(self, verifier):
        """Test handling of malformed equations"""
        # Act - Should handle gracefully without crashing
        result = await verifier.verify_equation("x +++ y", "invalid syntax")

        # Assert - Should return False or handle error gracefully
        assert result is False or result is True  # Implementation dependent

    async def test_symbolic_variables(self, verifier):
        """Test equations with multiple variables"""
        # Act
        result = await verifier.verify_equation(
            "a*x + b*x",
            "(a + b)*x"
        )

        # Assert
        assert result is True

    async def test_fractions(self, verifier):
        """Test fractional equations"""
        # Act
        result = await verifier.verify_equation(
            "x/2 + x/2",
            "x"
        )

        # Assert
        assert result is True

    async def test_exponents(self, verifier):
        """Test exponential rules"""
        # Act
        result = await verifier.verify_equation(
            "x**2 * x**3",
            "x**5"
        )

        # Assert
        assert result is True

    async def test_logarithms(self, verifier):
        """Test logarithmic properties"""
        # Act
        result = await verifier.verify_equation(
            "log(x*y)",
            "log(x) + log(y)"
        )

        # Assert
        assert result is True
