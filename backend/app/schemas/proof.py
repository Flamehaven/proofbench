# [*] ProofBench Backend - Pydantic Schemas
# API request/response data models with validation

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# [=] Request Schemas (Input from client)

class ProofStepCreate(BaseModel):
    """Schema for creating a new proof step"""
    claim: str = Field(..., min_length=1, description="Natural language claim/assertion")
    equation: Optional[Dict[str, str]] = Field(None, description="Mathematical equation in JSON format")
    dependencies: Optional[List[str]] = Field(default=None, description="List of dependent step IDs")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "claim": "By the commutative property of addition",
                "equation": {"lhs": "a + b", "rhs": "b + a"},
                "dependencies": ["step_1"]
            }
        }
    )


class ProofCreate(BaseModel):
    """Schema for submitting a new proof for verification"""
    domain: str = Field(..., min_length=1, description="Mathematical domain (algebra, topology, logic)")
    steps: List[ProofStepCreate] = Field(..., min_items=1, description="List of proof steps")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "domain": "algebra",
                "steps": [
                    {
                        "claim": "Start with the equation x + 5 = 10",
                        "equation": {"lhs": "x + 5", "rhs": "10"}
                    },
                    {
                        "claim": "Subtract 5 from both sides",
                        "equation": {"lhs": "x", "rhs": "5"},
                        "dependencies": ["0"]
                    }
                ]
            }
        }
    )


# [=] Response Schemas (Output to client)

class ProofStepResponse(ProofStepCreate):
    """Schema for proof step in API responses"""
    id: int
    step_index: int

    model_config = ConfigDict(from_attributes=True)


class ProofResultResponse(BaseModel):
    """Schema for proof verification result"""
    is_valid: bool = Field(..., description="Overall proof validity")
    lii_score: float = Field(..., ge=0, le=100, description="Logic Integrity Index (0-100)")
    confidence_interval: List[float] = Field(..., description="95% confidence interval [lower, upper]")
    coherence_score: float = Field(..., ge=0, le=100, description="Multi-LLM consensus coherence")
    step_results: List[Dict[str, Any]] = Field(..., description="Detailed results for each step")
    feedback: List[Dict[str, Any]] = Field(..., description="Natural language feedback")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "is_valid": True,
                "lii_score": 95.4,
                "confidence_interval": [92.1, 98.7],
                "coherence_score": 88.1,
                "step_results": [
                    {"step_id": 1, "symbolic_pass": True, "semantic_score": 92.5},
                    {"step_id": 2, "symbolic_pass": True, "semantic_score": 85.3}
                ],
                "feedback": [
                    {"type": "success", "summary": "Proof is logically sound"},
                    {"type": "info", "detail": "Strong symbolic verification"}
                ]
            }
        }
    )


class ProofResponse(BaseModel):
    """Schema for proof entity in API responses"""
    id: int
    created_at: datetime
    domain: str
    status: str = Field(..., description="Processing status (pending, processing, completed, failed)")
    steps: List[ProofStepResponse]
    result: Optional[ProofResultResponse] = Field(None, description="Available when status is 'completed'")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "created_at": "2025-10-16T12:00:00Z",
                "domain": "algebra",
                "status": "completed",
                "steps": [
                    {
                        "id": 1,
                        "step_index": 0,
                        "claim": "Start with x + 5 = 10",
                        "equation": {"lhs": "x + 5", "rhs": "10"}
                    }
                ],
                "result": {
                    "is_valid": True,
                    "lii_score": 95.4,
                    "confidence_interval": [92.1, 98.7],
                    "coherence_score": 88.1,
                    "step_results": [],
                    "feedback": []
                }
            }
        }
    )


# [=] Utility Schemas

class ProofListResponse(BaseModel):
    """Schema for paginated proof list"""
    total: int = Field(..., description="Total number of proofs")
    skip: int = Field(..., description="Number of skipped items")
    limit: int = Field(..., description="Maximum items per page")
    proofs: List[ProofResponse] = Field(..., description="List of proofs")

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Standard error response schema"""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": "Proof not found",
                "error_code": "PROOF_NOT_FOUND"
            }
        }
    )
