@echo off
echo ========================================
echo ProofBench Backend - Starting Server
echo ========================================
echo.

cd backend

echo [1/3] Checking environment...
python -c "from app.core.config import settings; print(f'OpenAI: {bool(settings.OPENAI_API_KEY)}'); print(f'Anthropic: {bool(settings.ANTHROPIC_API_KEY)}'); print(f'Google: {bool(settings.GOOGLE_API_KEY)}')"

echo.
echo [2/3] Starting backend server...
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

