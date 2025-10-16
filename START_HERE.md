# ProofBench Backend - Start Here

## Current Status: Ready to Launch!

All backend components are tested and working. You can start the server **right now** with or without LLM API keys.

---

## Option 1: Quick Start (No API Keys Needed)

**Start the server immediately** with symbolic verification only:

```bash
cd D:\Sanctum\Proofbench\proofbench-3.7.2-production\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will run with:
- ✅ Symbolic verification (SymPy)
- ⚠️  Semantic evaluation disabled (no LLM keys)
- ✅ All other features working

---

## Option 2: Full System with LLM (Recommended)

### Step 1: Get ONE API Key (choose easiest)

**OpenAI** (Recommended - easiest to set up):
1. Go to: https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)

**OR Anthropic**:
- https://console.anthropic.com/settings/keys

**OR Google AI**:
- https://makersuite.google.com/app/apikey

### Step 2: Add Key to .env File

```bash
# Open the .env file
notepad D:\Sanctum\Proofbench\proofbench-3.7.2-production\backend\.env

# Find this line:
OPENAI_API_KEY=

# Replace with your key:
OPENAI_API_KEY=sk-proj-your-actual-key-here

# Save and close
```

### Step 3: Start Server

```bash
cd D:\Sanctum\Proofbench\proofbench-3.7.2-production\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
[+] LLM providers available: openai
[+] Symbolic verifier initialized (SymPy-based)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Testing the API

### 1. Health Check

Open browser or curl:
```bash
curl http://localhost:8000/
```

### 2. Submit a Test Proof

```bash
curl -X POST http://localhost:8000/api/v1/proofs \
  -H "Content-Type: application/json" \
  -d "{\"domain\":\"algebra\",\"steps\":[{\"step_index\":1,\"claim\":\"Solve for x\",\"equation\":\"x + 5 = 10\",\"reasoning\":\"Subtract 5 from both sides\",\"dependencies\":[]}]}"
```

You'll get a response with a proof ID like:
```json
{"id": 1, "status": "queued", "domain": "algebra", ...}
```

### 3. Check Results (wait 10-15 seconds)

```bash
curl http://localhost:8000/api/v1/proofs/1
```

You'll see the verification results with:
- `is_valid`: true/false
- `lii_score`: Overall score (0-100)
- `step_results`: Detailed step-by-step analysis
- `feedback`: Human-readable feedback

---

## What You Get

**Without LLM Keys**:
- ✅ Symbolic verification (equation checking)
- ✅ Syntax validation
- ✅ Basic feedback
- ⚠️  No semantic reasoning analysis

**With LLM Keys**:
- ✅ Symbolic verification (equation checking)
- ✅ Semantic evaluation (reasoning quality)
- ✅ Multi-provider consensus (if multiple keys)
- ✅ Confidence intervals
- ✅ Coherence scoring
- ✅ Detailed feedback

---

## Troubleshooting

**"Port 8000 already in use"**:
```bash
# Use a different port
uvicorn app.main:app --reload --port 8001
```

**"Module not found"**:
```bash
# Install missing packages
pip install openai anthropic google-generativeai
```

**"No LLM providers available"**:
- This is fine! The system works without LLM keys (symbolic only)
- Add an API key if you want semantic evaluation

---

## Quick Commands Reference

```bash
# Start server
cd D:\Sanctum\Proofbench\proofbench-3.7.2-production\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test health
curl http://localhost:8000/

# Submit proof
curl -X POST http://localhost:8000/api/v1/proofs -H "Content-Type: application/json" -d "{\"domain\":\"algebra\",\"steps\":[...]}"

# Get proof status
curl http://localhost:8000/api/v1/proofs/{id}

# Stop server
# Press Ctrl+C in the server terminal
```

---

## Ready to Start?

**Minimum path** (30 seconds):
1. Run: `cd backend && uvicorn app.main:app --reload`
2. Test: Open http://localhost:8000 in browser
3. Done!

**Full system** (5 minutes):
1. Get one API key from OpenAI/Anthropic/Google
2. Add to `backend/.env`
3. Run: `cd backend && uvicorn app.main:app --reload`
4. Test with curl commands above
5. Enjoy full hybrid verification!

---

**Need help?** See:
- `QUICK_START.md` - Detailed setup guide
- `LLM_INTEGRATION_COMPLETE.md` - Complete documentation
- `backend/test_backend.py` - Run tests

**Ready to deploy?** All systems are production-ready!

