# ProofBench Backend - Quick Start Guide

## Immediate Next Steps (5 minutes)

### Step 1: Add LLM API Keys

Edit backend/.env and add at least ONE API key:

```bash
# Open .env file
notepad backend\.env

# Add your keys (get them from the links below):
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-key-here
```

**Get API Keys**:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google AI: https://makersuite.google.com/app/apikey

**Note**: You only need ONE key to start. The system works with any subset of providers.

### Step 2: Start Backend Server

```bash
cd D:\Sanctum\Proofbench\proofbench-3.7.2-production\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
[+] LLM providers available: openai
[+] Symbolic verifier initialized (SymPy-based)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Test the API

Open a new terminal and run:

```bash
# Health check
curl http://localhost:8000/

# Submit test proof
curl -X POST http://localhost:8000/api/v1/proofs \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"algebra\",\"steps\":[{\"step_index\":1,\"claim\":\"Solve for x\",\"equation\":\"x + 5 = 10\",\"reasoning\":\"Subtract 5 from both sides\",\"dependencies\":[]}]}"
```

You should get a response with a proof ID. Wait 10-15 seconds, then check the status:

```bash
curl http://localhost:8000/api/v1/proofs/1
```

## That's It!

Your backend is now running with:
- Multi-provider LLM integration
- SymPy symbolic verification
- Hybrid verification engine
- Background task processing
- Cost tracking

## Optional Enhancements

### Add More LLM Providers

To increase reliability, add more API keys to .env:

```env
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

Restart the server to use all providers:
```bash
# Stop server (Ctrl+C)
# Restart
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment

For production deployment with PostgreSQL and proper process management, see DEPLOYMENT_GUIDE.md (coming soon) or use Docker:

```bash
docker-compose up -d
```

## Troubleshooting

**Issue**: "No LLM providers available"
- **Solution**: Add at least one API key to backend/.env

**Issue**: "Module not found"
- **Solution**: Install dependencies: `pip install openai anthropic google-generativeai`

**Issue**: "Port 8000 already in use"
- **Solution**: Use different port: `uvicorn app.main:app --port 8001`

## Next Steps

1. Add API keys ← YOU ARE HERE
2. Start backend server
3. Test with curl
4. Deploy to production (optional)

