# [B] ProofBench Backend - API Endpoint Tests
# Integration tests for FastAPI endpoints

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.core.config import Settings


# [=] Test Application Setup
@pytest.fixture(scope="function")
async def test_app():
    """Create test FastAPI application"""
    # Import here to avoid circular imports
    from backend.main import app
    return app


@pytest.fixture(scope="function")
async def test_client(test_app, test_db_engine):
    """Create test HTTP client"""
    from app.db.session import get_db

    # Override database dependency
    async def override_get_db():
        session_maker = async_sessionmaker(
            test_db_engine,
            expire_on_commit=False
        )
        async with session_maker() as session:
            yield session

    test_app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(app=test_app, base_url="http://test") as client:
        yield client

    test_app.dependency_overrides.clear()


@pytest.mark.asyncio
class TestProofEndpoints:
    """Test suite for proof API endpoints"""

    async def test_create_proof(self, test_client, sample_proof_data):
        """Test POST /api/v1/proofs - Create proof"""
        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["id"] is not None
        assert data["domain"] == "algebra"
        assert data["status"] == "pending"
        assert len(data["steps"]) == 2

    async def test_create_proof_without_api_key(self, test_client, sample_proof_data):
        """Test creating proof without API key fails"""
        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data
        )

        # Assert
        assert response.status_code == 401

    async def test_create_proof_invalid_data(self, test_client):
        """Test creating proof with invalid data"""
        # Arrange
        invalid_data = {
            "domain": "algebra"
            # Missing required 'steps' field
        }

        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            json=invalid_data,
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 422  # Validation error

    async def test_get_proof_by_id(self, test_client, sample_proof_data):
        """Test GET /api/v1/proofs/{id} - Get proof"""
        # Arrange - Create a proof first
        create_response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "test-api-key"}
        )
        proof_id = create_response.json()["id"]

        # Act
        response = await test_client.get(
            f"/api/v1/proofs/{proof_id}",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == proof_id
        assert data["domain"] == "algebra"

    async def test_get_nonexistent_proof(self, test_client):
        """Test getting non-existent proof returns 404"""
        # Act
        response = await test_client.get(
            "/api/v1/proofs/99999",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 404

    async def test_list_proofs(self, test_client, sample_proof_data):
        """Test GET /api/v1/proofs - List proofs"""
        # Arrange - Create multiple proofs
        for i in range(3):
            await test_client.post(
                "/api/v1/proofs",
                json=sample_proof_data,
                headers={"X-API-Key": "test-api-key"}
            )

        # Act
        response = await test_client.get(
            "/api/v1/proofs",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

    async def test_list_proofs_with_pagination(self, test_client, sample_proof_data):
        """Test list proofs with pagination parameters"""
        # Arrange - Create 5 proofs
        for i in range(5):
            await test_client.post(
                "/api/v1/proofs",
                json=sample_proof_data,
                headers={"X-API-Key": "test-api-key"}
            )

        # Act
        response = await test_client.get(
            "/api/v1/proofs?skip=0&limit=2",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    async def test_verify_proof(self, test_client, sample_proof_data):
        """Test POST /api/v1/proofs/{id}/verify - Start verification"""
        # Arrange - Create a proof first
        create_response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "test-api-key"}
        )
        proof_id = create_response.json()["id"]

        # Act
        response = await test_client.post(
            f"/api/v1/proofs/{proof_id}/verify",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 202  # Accepted (background task)
        data = response.json()
        assert data["message"] == "Verification started"
        assert data["proof_id"] == proof_id

    async def test_get_proof_result(self, test_client, sample_proof_data):
        """Test GET /api/v1/proofs/{id}/result - Get verification result"""
        # Arrange - Create and verify a proof
        create_response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "test-api-key"}
        )
        proof_id = create_response.json()["id"]

        await test_client.post(
            f"/api/v1/proofs/{proof_id}/verify",
            headers={"X-API-Key": "test-api-key"}
        )

        # Act
        response = await test_client.get(
            f"/api/v1/proofs/{proof_id}/result",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        # Result might be pending if verification hasn't completed
        assert response.status_code in [200, 404]

    async def test_delete_proof(self, test_client, sample_proof_data):
        """Test DELETE /api/v1/proofs/{id} - Delete proof"""
        # Arrange - Create a proof first
        create_response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "test-api-key"}
        )
        proof_id = create_response.json()["id"]

        # Act
        response = await test_client.delete(
            f"/api/v1/proofs/{proof_id}",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 204

        # Verify proof is deleted
        get_response = await test_client.get(
            f"/api/v1/proofs/{proof_id}",
            headers={"X-API-Key": "test-api-key"}
        )
        assert get_response.status_code == 404

    async def test_health_check(self, test_client):
        """Test GET / - Health check endpoint"""
        # Act
        response = await test_client.get("/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert "version" in data


@pytest.mark.asyncio
class TestAPIErrorHandling:
    """Test suite for API error handling"""

    async def test_invalid_api_key(self, test_client, sample_proof_data):
        """Test request with invalid API key"""
        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            json=sample_proof_data,
            headers={"X-API-Key": "invalid-key"}
        )

        # Assert
        assert response.status_code == 401

    async def test_missing_required_fields(self, test_client):
        """Test request with missing required fields"""
        # Arrange
        incomplete_data = {
            "steps": []  # Missing domain
        }

        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            json=incomplete_data,
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 422

    async def test_invalid_json(self, test_client):
        """Test request with invalid JSON"""
        # Act
        response = await test_client.post(
            "/api/v1/proofs",
            content="invalid json",
            headers={
                "X-API-Key": "test-api-key",
                "Content-Type": "application/json"
            }
        )

        # Assert
        assert response.status_code == 422

    async def test_method_not_allowed(self, test_client):
        """Test unsupported HTTP method"""
        # Act
        response = await test_client.patch(
            "/api/v1/proofs",
            headers={"X-API-Key": "test-api-key"}
        )

        # Assert
        assert response.status_code == 405


@pytest.mark.asyncio
class TestCORS:
    """Test suite for CORS configuration"""

    async def test_cors_headers_present(self, test_client):
        """Test CORS headers are present in response"""
        # Act
        response = await test_client.options(
            "/api/v1/proofs",
            headers={"Origin": "http://localhost:3000"}
        )

        # Assert
        assert "access-control-allow-origin" in response.headers

    async def test_preflight_request(self, test_client):
        """Test CORS preflight request"""
        # Act
        response = await test_client.options(
            "/api/v1/proofs",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "X-API-Key"
            }
        )

        # Assert
        assert response.status_code == 200
