# [B] ProofBench Backend - CRUD Tests
# Unit tests for proof CRUD operations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.crud_proof import proof as crud_proof
from app.schemas.proof import ProofCreate, ProofStepCreate
from app.models.proof import ProofStatus


@pytest.mark.asyncio
class TestCRUDProof:
    """Test suite for proof CRUD operations"""

    async def test_create_proof_with_steps(self, db_session: AsyncSession, sample_proof_data):
        """Test creating a proof with steps"""
        # Arrange
        proof_create = ProofCreate(**sample_proof_data)

        # Act
        db_proof = await crud_proof.create_with_steps(db=db_session, obj_in=proof_create)

        # Assert
        assert db_proof.id is not None
        assert db_proof.domain == "algebra"
        assert db_proof.status == ProofStatus.PENDING
        assert len(db_proof.steps) == 2
        assert db_proof.steps[0].claim == "Addition is commutative"
        assert db_proof.steps[1].dependencies == [0]

    async def test_get_proof_by_id(self, db_session: AsyncSession, sample_proof):
        """Test retrieving a proof by ID"""
        # Act
        retrieved_proof = await crud_proof.get(db=db_session, id=sample_proof.id)

        # Assert
        assert retrieved_proof is not None
        assert retrieved_proof.id == sample_proof.id
        assert retrieved_proof.domain == sample_proof.domain
        assert len(retrieved_proof.steps) == len(sample_proof.steps)

    async def test_get_nonexistent_proof(self, db_session: AsyncSession):
        """Test retrieving a non-existent proof returns None"""
        # Act
        retrieved_proof = await crud_proof.get(db=db_session, id=99999)

        # Assert
        assert retrieved_proof is None

    async def test_get_multi_proofs(self, db_session: AsyncSession, sample_proof_data):
        """Test retrieving multiple proofs with pagination"""
        # Arrange - Create 3 proofs
        for i in range(3):
            proof_create = ProofCreate(**sample_proof_data)
            await crud_proof.create_with_steps(db=db_session, obj_in=proof_create)

        # Act
        proofs = await crud_proof.get_multi(db=db_session, skip=0, limit=10)

        # Assert
        assert len(proofs) == 3

    async def test_get_multi_with_pagination(self, db_session: AsyncSession, sample_proof_data):
        """Test pagination works correctly"""
        # Arrange - Create 5 proofs
        for i in range(5):
            proof_create = ProofCreate(**sample_proof_data)
            await crud_proof.create_with_steps(db=db_session, obj_in=proof_create)

        # Act
        page1 = await crud_proof.get_multi(db=db_session, skip=0, limit=2)
        page2 = await crud_proof.get_multi(db=db_session, skip=2, limit=2)

        # Assert
        assert len(page1) == 2
        assert len(page2) == 2
        assert page1[0].id != page2[0].id

    async def test_update_status(self, db_session: AsyncSession, sample_proof):
        """Test updating proof status"""
        # Act
        await crud_proof.update_status(
            db=db_session,
            proof_id=sample_proof.id,
            status="processing"
        )

        # Verify
        updated_proof = await crud_proof.get(db=db_session, id=sample_proof.id)

        # Assert
        assert updated_proof.status == "processing"

    async def test_create_result(self, db_session: AsyncSession, sample_proof):
        """Test creating verification result"""
        # Arrange
        result_data = {
            "is_valid": True,
            "lii_score": 92.5,
            "confidence_interval": [88.0, 97.0],
            "coherence_score": 95.0,
            "step_results": [
                {"step_id": 1, "symbolic_pass": True, "semantic_score": 90.0}
            ],
            "feedback": [
                {"type": "success", "summary": "Proof is valid"}
            ]
        }

        # Act
        result = await crud_proof.create_result(
            db=db_session,
            proof_id=sample_proof.id,
            obj_in=result_data
        )

        # Assert
        assert result.id is not None
        assert result.proof_id == sample_proof.id
        assert result.is_valid is True
        assert result.lii_score == 92.5
        assert len(result.step_results) == 1

    async def test_delete_proof(self, db_session: AsyncSession, sample_proof):
        """Test deleting a proof"""
        # Act
        deleted = await crud_proof.delete(db=db_session, id=sample_proof.id)

        # Verify
        retrieved = await crud_proof.get(db=db_session, id=sample_proof.id)

        # Assert
        assert deleted is True
        assert retrieved is None

    async def test_delete_nonexistent_proof(self, db_session: AsyncSession):
        """Test deleting non-existent proof returns False"""
        # Act
        deleted = await crud_proof.delete(db=db_session, id=99999)

        # Assert
        assert deleted is False

    async def test_proof_steps_ordering(self, db_session: AsyncSession, sample_proof_data):
        """Test that proof steps maintain correct order"""
        # Arrange
        proof_create = ProofCreate(**sample_proof_data)

        # Act
        db_proof = await crud_proof.create_with_steps(db=db_session, obj_in=proof_create)

        # Assert
        assert db_proof.steps[0].step_index == 0
        assert db_proof.steps[1].step_index == 1
        assert db_proof.steps[0].claim == "Addition is commutative"
        assert db_proof.steps[1].claim == "Simplify expression"
