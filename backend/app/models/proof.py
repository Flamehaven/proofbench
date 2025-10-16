# [*] ProofBench Backend - Database Models
# SQLAlchemy 2.0 ORM models for proof verification system

import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Float, DateTime, Text, ForeignKey, JSON, Boolean, Integer, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from app.db.base import Base


class ProofStatus(str, enum.Enum):
    """Proof processing status enum"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Proof(Base):
    """
    Main proof entity representing a mathematical proof submission.

    Attributes:
        id: Primary key
        created_at: Timestamp of proof submission
        domain: Mathematical domain (algebra, topology, logic, etc.)
        status: Current processing status
        steps: List of proof steps (one-to-many relationship)
        result: Verification result (one-to-one relationship)
    """
    __tablename__ = "proofs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    domain: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    status: Mapped[ProofStatus] = mapped_column(
        Enum(ProofStatus),
        default=ProofStatus.PENDING,
        nullable=False
    )

    # Relationships
    steps: Mapped[List["ProofStep"]] = relationship(
        back_populates="proof",
        cascade="all, delete-orphan",
        order_by="ProofStep.step_index"
    )
    result: Mapped[Optional["ProofResult"]] = relationship(
        back_populates="proof",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Proof(id={self.id}, domain='{self.domain}', status='{self.status}')>"


class ProofStep(Base):
    """
    Individual step within a proof.

    Attributes:
        id: Primary key
        proof_id: Foreign key to parent proof
        step_index: Sequential index of this step (0-based)
        claim: Natural language claim/assertion
        equation: Optional mathematical equation (JSON format)
        dependencies: List of step IDs that this step depends on
    """
    __tablename__ = "proof_steps"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    proof_id: Mapped[int] = mapped_column(
        ForeignKey("proofs.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    step_index: Mapped[int] = mapped_column(Integer, nullable=False)
    claim: Mapped[str] = mapped_column(Text, nullable=False)
    equation: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    dependencies: Mapped[Optional[list]] = mapped_column(JSON, nullable=True, default=list)

    # Relationship
    proof: Mapped["Proof"] = relationship(back_populates="steps")

    def __repr__(self) -> str:
        return f"<ProofStep(id={self.id}, proof_id={self.proof_id}, index={self.step_index})>"


class ProofResult(Base):
    """
    Verification result for a completed proof.

    Attributes:
        id: Primary key
        proof_id: Foreign key to parent proof (one-to-one)
        is_valid: Overall validity of the proof
        lii_score: Logic Integrity Index (0-100)
        confidence_interval: 95% confidence interval [lower, upper]
        coherence_score: Multi-LLM consensus coherence (0-100)
        step_results: Detailed results for each step (JSON array)
        feedback: Natural language feedback (JSON array)
    """
    __tablename__ = "proof_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    proof_id: Mapped[int] = mapped_column(
        ForeignKey("proofs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Verification scores
    is_valid: Mapped[bool] = mapped_column(Boolean, nullable=False)
    lii_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_interval: Mapped[list] = mapped_column(JSON, nullable=False)  # [lower, upper]
    coherence_score: Mapped[float] = mapped_column(Float, nullable=False)

    # Detailed results (stored as JSON)
    step_results: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    feedback: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    # Relationship
    proof: Mapped["Proof"] = relationship(back_populates="result")

    def __repr__(self) -> str:
        return f"<ProofResult(proof_id={self.proof_id}, valid={self.is_valid}, lii={self.lii_score:.1f})>"
