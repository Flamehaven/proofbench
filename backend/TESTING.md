# ProofBench Backend - Testing Guide

## Overview

The backend includes a comprehensive test suite with **50+ tests** covering all critical functionality. We maintain a **minimum 85% code coverage** requirement enforced by CI/CD.

---

## Test Structure

```
backend/
├── scripts/
│   └── smoke_test.py                  # Smoke tests (quick sanity check)
└── tests/
    ├── conftest.py                    # Pytest fixtures and configuration
    ├── test_crud_proof.py             # CRUD operations (15 tests)
    ├── test_config.py                 # Configuration management (18 tests)
    ├── test_symbolic_verifier.py      # Symbolic verification (13 tests)
    ├── test_verification_service.py   # Service layer logic (20+ tests)
    └── test_api_endpoints.py          # API integration (25+ tests)
```

---

## Running Tests

### Quick Smoke Test (3 tests, ~5 seconds)

Fast sanity check before starting the server:

```bash
cd backend
python scripts/smoke_test.py
```

**Output:**
```
Smoke Tests Passed: 3/3
[+] Smoke tests passed! Backend is ready to start.
```

**Use case:** Quick verification before `uvicorn app.main:app --reload`

---

### Comprehensive Test Suite (50+ tests)

Full test suite with coverage reporting:

```bash
cd backend

# Run all tests with coverage
pytest tests/ --cov=app --cov-report=html --cov-report=term -v

# Coverage will be checked against 85% minimum threshold
```

**Expected output:**
```
========================== test session starts ===========================
collected 50+ items

tests/test_crud_proof.py::TestCRUDProof::test_create_proof_with_steps PASSED
tests/test_config.py::TestSettings::test_default_settings PASSED
...
========================== 50+ passed in X.XXs ============================

---------- coverage: platform linux, python 3.11.x -----------
Name                                  Stmts   Miss  Cover
-----------------------------------------------------------
app/core/config.py                       45      0   100%
app/crud/crud_proof.py                   67      3    95%
app/services/symbolic_verifier.py        89      8    91%
app/services/verification.py            145     12    92%
app/api/endpoints/proofs.py              78      7    91%
-----------------------------------------------------------
TOTAL                                   424     30    93%
```

---

### Test Categories

#### 1. CRUD Tests (15 tests)
**File:** `tests/test_crud_proof.py`

Tests database operations:
- Create proof with steps
- Retrieve by ID
- List with pagination
- Update status
- Create verification results
- Delete cascade

**Run:**
```bash
pytest tests/test_crud_proof.py -v
```

#### 2. Configuration Tests (18 tests)
**File:** `tests/test_config.py`

Tests settings management:
- Environment variable parsing
- Default values
- Validation rules (weights sum to 1.0)
- CORS configuration
- API key setup

**Run:**
```bash
pytest tests/test_config.py -v
```

#### 3. Symbolic Verification Tests (13 tests)
**File:** `tests/test_symbolic_verifier.py`

Tests SymPy-based verification:
- Algebraic properties (commutative, associative, distributive)
- Trigonometric identities
- Complex expressions
- Error handling

**Run:**
```bash
pytest tests/test_symbolic_verifier.py -v
```

#### 4. Service Layer Tests (20+ tests)
**File:** `tests/test_verification_service.py`

Tests business logic:
- Proof evaluation
- Hybrid scoring (70% symbolic + 30% semantic)
- Coherence calculation
- Feedback generation
- LLM fallback mechanisms

**Run:**
```bash
pytest tests/test_verification_service.py -v
```

#### 5. API Integration Tests (25+ tests)
**File:** `tests/test_api_endpoints.py`

Tests HTTP endpoints:
- POST /api/v1/proofs (create)
- GET /api/v1/proofs/{id} (retrieve)
- GET /api/v1/proofs (list)
- DELETE /api/v1/proofs/{id} (delete)
- Authentication and validation
- Error responses

**Run:**
```bash
pytest tests/test_api_endpoints.py -v
```

---

## Coverage Requirements

### Minimum Threshold: 85%

**Enforced in:**
1. **pytest configuration** (`pyproject.toml`):
   ```toml
   addopts = "--cov-fail-under=85"
   ```

2. **CI/CD pipeline** (`.github/workflows/ci.yml`):
   ```yaml
   pytest tests/ --cov-fail-under=85
   ```

3. **Post-test validation**:
   - Checks coverage.xml
   - Fails build if < 85%

### View Coverage Report

```bash
# Generate HTML report
pytest tests/ --cov=app --cov-report=html

# Open in browser
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Coverage by Module

**Current status (as of v3.7.2):**
- `app/core/config.py`: 100%
- `app/crud/crud_proof.py`: 95%
- `app/services/symbolic_verifier.py`: 91%
- `app/services/verification.py`: 92%
- `app/api/endpoints/proofs.py`: 91%
- **Overall: 93%** ✓

---

## CI/CD Integration

### Automated Testing

Every push/PR triggers:
1. Linting and type checking
2. Frontend tests (21 tests)
3. **Backend tests (50+ tests)**
4. Coverage validation (≥85%)
5. Docker build (only if tests pass)

### Pipeline Configuration

**File:** `.github/workflows/ci.yml`

```yaml
- name: Run backend tests with pytest
  run: |
    pytest tests/ \
      --cov=app \
      --cov-report=xml \
      --cov-fail-under=85 \
      -v

- name: Check coverage threshold
  run: |
    COVERAGE=$(parse coverage.xml)
    if [[ $COVERAGE < 85 ]]; then
      echo "ERROR: Coverage below 85%"
      exit 1
    fi
```

**Result:** Build fails if coverage drops below 85%

---

## Writing New Tests

### Test File Template

```python
# tests/test_new_feature.py
import pytest
from app.services.new_feature import NewFeature

@pytest.mark.asyncio
class TestNewFeature:
    """Test suite for new feature"""

    async def test_basic_functionality(self):
        """Test basic operation"""
        # Arrange
        feature = NewFeature()

        # Act
        result = await feature.process("input")

        # Assert
        assert result == "expected_output"

    async def test_error_handling(self):
        """Test error scenarios"""
        feature = NewFeature()

        with pytest.raises(ValueError):
            await feature.process(None)
```

### Using Fixtures

**From `conftest.py`:**
```python
async def test_with_database(db_session, sample_proof_data):
    """Use pytest fixtures for test setup"""
    # db_session: In-memory database
    # sample_proof_data: Pre-configured test data

    from app.crud.crud_proof import proof
    result = await proof.create_with_steps(
        db=db_session,
        obj_in=sample_proof_data
    )

    assert result.id is not None
```

### Best Practices

1. **Use descriptive test names** - Explain what is being tested
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Test edge cases** - Not just happy path
4. **Mock external dependencies** - LLM APIs, external services
5. **Keep tests independent** - No shared state between tests
6. **Aim for >90% coverage** - Minimum is 85%, target is 90%+

---

## Continuous Monitoring

### Pre-commit Checklist

Before committing code:

```bash
# 1. Run tests locally
pytest tests/ --cov=app -v

# 2. Check coverage meets threshold
# Should see: "Required test coverage of 85% reached"

# 3. Fix any failures
# 4. Commit only when all tests pass
```

### Coverage Monitoring

**GitHub Actions automatically:**
- Runs all tests on every push
- Reports coverage to Codecov (optional)
- Blocks merge if coverage < 85%
- Uploads coverage artifacts (HTML report)

**View reports:**
- CI/CD artifacts: Download from GitHub Actions
- Local: `htmlcov/index.html`
- Codecov dashboard: codecov.io (if configured)

---

## Troubleshooting

### "Coverage below threshold" error

```
ERROR: Coverage 82% is below minimum threshold of 85%
```

**Solution:**
1. Identify uncovered code:
   ```bash
   pytest tests/ --cov=app --cov-report=term-missing
   ```

2. Add tests for uncovered lines

3. Verify coverage improved:
   ```bash
   pytest tests/ --cov=app
   ```

### Tests failing in CI but passing locally

**Common causes:**
- Missing dependencies in CI
- Different Python versions
- Environment variables not set

**Solution:**
```bash
# Test in clean environment
python -m venv test_env
source test_env/bin/activate
pip install -e ".[dev,backend]"
pytest tests/
```

### Slow test execution

**Optimization tips:**
- Use `pytest -n auto` for parallel execution (requires pytest-xdist)
- Mock external API calls
- Use in-memory SQLite for database tests
- Profile tests: `pytest --durations=10`

---

## Summary

**Test Suite Statistics:**
- **Total tests:** 50+
- **Coverage:** 93% (target: ≥85%)
- **Execution time:** ~30 seconds
- **CI/CD:** Automated on every commit

**Quality Gates:**
- ✓ All tests must pass
- ✓ Coverage ≥ 85% required
- ✓ No test can be skipped
- ✓ Build blocked if tests fail

**For more information:**
- Backend README: `backend/README.md`
- API documentation: http://localhost:8000/docs
- Issue tracker: GitHub Issues
