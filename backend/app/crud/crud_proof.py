# [L] ProofBench Backend - CRUD Operations
# Database operations for proof entities

from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.proof import Proof, ProofStep, ProofResult, ProofStatus
from app.schemas.proof import ProofCreate, ProofStepCreate


class CRUDProof:
    """CRUD operations for Proof entities"""

    async def create_with_steps(
        self,
        db: AsyncSession,
        *,
        obj_in: ProofCreate
    ) -> Proof:
        """
        Create a new proof with its steps.

        Args:
            db: Database session
            obj_in: ProofCreate schema with domain and steps

        Returns:
            Proof: Created proof entity with steps
        """
        # Create proof entity
        db_proof = Proof(
            domain=obj_in.domain,
            status=ProofStatus.PENDING
        )
        db.add(db_proof)
        await db.flush()  # Get proof ID without committing

        # Create proof steps
        for idx, step_data in enumerate(obj_in.steps):
            db_step = ProofStep(
                proof_id=db_proof.id,
                step_index=idx,
                claim=step_data.claim,
                equation=step_data.equation,
                dependencies=step_data.dependencies or []
            )
            db.add(db_step)

        await db.commit()
        await db.refresh(db_proof)

        # Load relationships
        result = await db.execute(
            select(Proof)
            .where(Proof.id == db_proof.id)
            .options(selectinload(Proof.steps))
        )
        return result.scalar_one()

    async def get(
        self,
        db: AsyncSession,
        *,
        id: int
    ) -> Optional[Proof]:
        """
        Get a proof by ID with all relationships loaded.

        Args:
            db: Database session
            id: Proof ID

        Returns:
            Optional[Proof]: Proof entity or None if not found
        """
        result = await db.execute(
            select(Proof)
            .where(Proof.id == id)
            .options(
                selectinload(Proof.steps),
                selectinload(Proof.result)
            )
        )
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List[Proof]:
        """
        Get multiple proofs with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List[Proof]: List of proof entities
        """
        result = await db.execute(
            select(Proof)
            .options(
                selectinload(Proof.steps),
                selectinload(Proof.result)
            )
            .offset(skip)
            .limit(limit)
            .order_by(Proof.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_status(
        self,
        db: AsyncSession,
        *,
        proof_id: int,
        status: str
    ) -> None:
        """
        Update proof status.

        Args:
            db: Database session
            proof_id: Proof ID
            status: New status (pending, processing, completed, failed)
        """
        await db.execute(
            update(Proof)
            .where(Proof.id == proof_id)
            .values(status=status)
        )
        await db.commit()

    async def create_result(
        self,
        db: AsyncSession,
        *,
        proof_id: int,
        obj_in: dict
    ) -> ProofResult:
        """
        Create verification result for a proof.

        Args:
            db: Database session
            proof_id: Proof ID
            obj_in: Dictionary with result data

        Returns:
            ProofResult: Created result entity
        """
        db_result = ProofResult(
            proof_id=proof_id,
            is_valid=obj_in["is_valid"],
            lii_score=obj_in["lii_score"],
            confidence_interval=obj_in["confidence_interval"],
            coherence_score=obj_in["coherence_score"],
            step_results=obj_in["step_results"],
            feedback=obj_in["feedback"]
        )
        db.add(db_result)
        await db.commit()
        await db.refresh(db_result)
        return db_result

    async def delete(
        self,
        db: AsyncSession,
        *,
        id: int
    ) -> bool:
        """
        Delete a proof and all related data (cascade).

        Args:
            db: Database session
            id: Proof ID

        Returns:
            bool: True if deleted, False if not found
        """
        result = await db.execute(
            select(Proof).where(Proof.id == id)
        )
        proof = result.scalar_one_or_none()

        if proof:
            await db.delete(proof)
            await db.commit()
            return True
        return False


# [+] Global CRUD instance
proof = CRUDProof()
