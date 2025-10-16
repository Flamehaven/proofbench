#!/usr/bin/env python3
"""
ProofBench Backend - Smoke Test Script

Quick smoke tests to verify backend is ready to start.
For comprehensive testing, use: pytest tests/ --cov=app

This script provides fast sanity checks before server startup.

Usage:
    cd backend
    python scripts/smoke_test.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path (parent of scripts/)
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


async def test_imports():
    """Smoke test: Verify all critical modules can be imported"""
    print("[1/3] Testing imports...")
    try:
        from app.core.config import settings
        from app.models.proof import Proof
        from app.services.verification import BackendProofEngine
        print("    [+] Critical modules imported successfully")
        return True
    except Exception as e:
        print(f"    [-] Import failed: {e}")
        return False


async def test_config():
    """Smoke test: Verify configuration loads correctly"""
    print("[2/3] Testing configuration...")
    try:
        from app.core.config import settings

        # Verify critical settings
        assert settings.APP_NAME, "APP_NAME not configured"
        assert settings.APP_VERSION, "APP_VERSION not configured"
        assert settings.DATABASE_URL, "DATABASE_URL not configured"

        print(f"    App: {settings.APP_NAME} v{settings.APP_VERSION}")
        print(f"    Database: {settings.DATABASE_URL[:50]}...")
        print("    [+] Configuration valid")
        return True
    except Exception as e:
        print(f"    [-] Config error: {e}")
        return False


async def test_symbolic_verifier():
    """Smoke test: Verify symbolic verifier basic functionality"""
    print("[3/3] Testing symbolic verifier...")
    try:
        from app.services.symbolic_verifier import BackendSymbolicVerifier
        verifier = BackendSymbolicVerifier()

        # Single basic test
        result = await verifier.verify_equation("x + 1", "1 + x")
        assert result == True, "Basic commutativity test failed"

        print("    [+] Symbolic verifier operational")
        return True
    except Exception as e:
        print(f"    [-] Symbolic verifier error: {e}")
        return False


async def main():
    """Run smoke tests"""
    print("=" * 60)
    print("ProofBench Backend - Smoke Test")
    print("=" * 60)
    print()
    print("NOTE: This is a quick sanity check.")
    print("For comprehensive testing, run: pytest tests/ --cov=app")
    print()

    tests = [
        test_imports,
        test_config,
        test_symbolic_verifier,
    ]

    results = []
    for test in tests:
        try:
            result = await test()
            results.append(result)
        except Exception as e:
            print(f"    [!] Test crashed: {e}")
            results.append(False)
        print()

    # Summary
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"Smoke Tests Passed: {passed}/{total}")

    if passed == total:
        print("[+] Smoke tests passed! Backend is ready to start.")
        print()
        print("Quick start:")
        print("  uvicorn app.main:app --reload")
        print()
        print("For comprehensive testing:")
        print("  pytest tests/ --cov=app --cov-report=html -v")
        return 0
    else:
        print("[-] Smoke tests failed. Check configuration and dependencies.")
        print()
        print("Troubleshooting:")
        print("  1. Verify .env file exists with correct settings")
        print("  2. Install dependencies: pip install -e '.[dev,backend]'")
        print("  3. Run full tests: pytest tests/ -v")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
