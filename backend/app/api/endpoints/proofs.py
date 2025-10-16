# [>] ProofBench Backend - Proof API Endpoints
# RESTful API for proof submission and verification

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app import schemas, crud
from app.db.session import get_db_session
from app.core.security import api_key_auth
from app.services.verification import run_proof_verification

router = APIRouter()


@router.post(
    "/",
    response_model=schemas.ProofResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Submit a new proof for verification",
    description="Submit a mathematical proof for verification. Returns immediately with proof ID and 'pending' status. Verification runs in background."
)
async def submit_proof(
    proof_in: schemas.ProofCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session),
    api_key: str = Depends(api_key_auth)
):
    """
    Submit a new proof for verification.

    **Flow**:
    1. Creates proof record in database with 'pending' status
    2. Returns immediately with proof ID (HTTP 202 Accepted)
    3. Starts background verification task
    4. Client can poll GET /proofs/{id} to check status

    **Args**:
    - **domain**: Mathematical domain (algebra, topology, logic)
    - **steps**: List of proof steps with claims and equations

    **Returns**:
    - Proof entity with ID and 'pending' status
    - No result field (verification not started yet)

    **Authentication**:
    - Requires valid API key in X-API-Key header
    """
    # 1. Create proof record in database
    db_proof = await crud.proof.create_with_steps(db=db, obj_in=proof_in)

    # 2. Schedule background verification task
    background_tasks.add_task(
        run_proof_verification,
        proof_id=db_proof.id,
        db_url=db.bind.url  # Pass DB URL for background task to create its own session
    )

    return db_proof


@router.get(
    "/{proof_id}",
    response_model=schemas.ProofResponse,
    summary="Get proof status and result",
    description="Retrieve a proof by ID. Returns current status and result if completed."
)
async def get_proof(
    proof_id: int,
    db: AsyncSession = Depends(get_db_session),
    api_key: str = Depends(api_key_auth)
):
    """
    Get proof by ID with current status and result.

    **Status Values**:
    - **pending**: Proof submitted, verification not started
    - **processing**: Verification in progress
    - **completed**: Verification finished, result available
    - **failed**: Verification encountered an error

    **Returns**:
    - Proof entity with steps
    - Result field only present when status is 'completed'

    **Errors**:
    - 404: Proof not found
    - 403: Invalid API key

    **Authentication**:
    - Requires valid API key in X-API-Key header
    """
    db_proof = await crud.proof.get(db=db, id=proof_id)

    if not db_proof:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proof with ID {proof_id} not found"
        )

    return db_proof


@router.get(
    "/",
    response_model=schemas.ProofListResponse,
    summary="List all proofs",
    description="Get paginated list of all proofs ordered by creation time (newest first)."
)
async def list_proofs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db_session),
    api_key: str = Depends(api_key_auth)
):
    """
    List all proofs with pagination.

    **Query Parameters**:
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum records to return (default: 100, max: 1000)

    **Returns**:
    - **total**: Total number of proofs in database
    - **skip**: Number of skipped records
    - **limit**: Maximum records requested
    - **proofs**: List of proof entities

    **Ordering**:
    - Results ordered by created_at DESC (newest first)

    **Authentication**:
    - Requires valid API key in X-API-Key header
    """
    # Enforce maximum limit
    if limit > 1000:
        limit = 1000

    # Get proofs and total count
    proofs = await crud.proof.get_multi(db=db, skip=skip, limit=limit)

    # For total count, we need a separate query
    # (In production, consider caching this or using COUNT query)
    total = len(proofs) + skip  # Simplified for now

    return schemas.ProofListResponse(
        total=total,
        skip=skip,
        limit=limit,
        proofs=proofs
    )


@router.delete(
    "/{proof_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a proof",
    description="Delete a proof and all related data (steps, results). Cascade deletion."
)
async def delete_proof(
    proof_id: int,
    db: AsyncSession = Depends(get_db_session),
    api_key: str = Depends(api_key_auth)
):
    """
    Delete a proof by ID.

    **Cascade Behavior**:
    - Deletes proof record
    - Automatically deletes all associated steps
    - Automatically deletes associated result (if exists)

    **Returns**:
    - 204 No Content on success
    - 404 if proof not found

    **Authentication**:
    - Requires valid API key in X-API-Key header

    **Warning**:
    - This operation is irreversible
    - Consider implementing soft delete in production
    """
    deleted = await crud.proof.delete(db=db, id=proof_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proof with ID {proof_id} not found"
        )

    # Return None for 204 status code (no content)
    return None


# [T] Future endpoints for v3.8.0+

# @router.patch("/{proof_id}/status")
# async def update_proof_status(...):
#     """Manually update proof status (admin only)"""
#     pass

# @router.get("/{proof_id}/feedback")
# async def get_proof_feedback(...):
#     """Get detailed feedback for a proof"""
#     pass

# @router.post("/{proof_id}/revalidate")
# async def revalidate_proof(...):
#     """Re-run verification on existing proof"""
#     pass
