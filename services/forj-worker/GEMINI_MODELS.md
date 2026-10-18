# Gemini Model Configuration Guide

This project uses Google's Gemini models for AI-powered skill interpretation and analysis. Both **Gemini 2.5 Flash** and **Gemini 2.5 Pro** are available on the free tier.

## Available Models

### 🚀 Gemini 2.5 Flash (Recommended - Default)
**Best for**: Fast responses, high throughput, cost efficiency

**URL**: 
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**Characteristics**:
- ⚡ **Speed**: Fastest response times
- 💰 **Cost**: Most economical (free tier)
- 🎯 **Quality**: Excellent for structured outputs
- 📊 **Use Cases**: 
  - README analysis
  - Skill extraction
  - Technical summarization
  - Code interpretation

### 🎓 Gemini 2.5 Pro
**Best for**: Complex reasoning, nuanced analysis, highest quality

**URL**: 
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent
```

**Characteristics**:
- 🧠 **Reasoning**: Superior analytical capabilities
- 🎯 **Quality**: Highest quality outputs
- ⏱️ **Speed**: Slower than Flash but still fast
- 💰 **Cost**: Still on free tier
- 📊 **Use Cases**: 
  - Complex architecture analysis
  - Advanced skill inference
  - Detailed technical assessments
  - Multi-step reasoning tasks

## Configuration

### Current Configuration

The project is configured to use **Gemini 2.5 Flash** by default.

Check your current settings in:
- **Root**: `.env`
- **Worker Config**: `services/forj-worker/app/config.py`
- **Edge Function**: `supabase/functions/extract-skills/index.ts`

### Switching Models

#### Option 1: Update .env File (Recommended)

Edit `c:\Users\Lenovo\OneDrive\Desktop\Forj\.env`:

**For Gemini 2.5 Flash (Default):**
```env
LLM_API_KEY=your_api_key_here
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
```

**For Gemini 2.5 Pro:**
```env
LLM_API_KEY=your_api_key_here
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent
```

#### Option 2: Environment Variable

Set the environment variable before starting services:

**Windows (CMD):**
```cmd
set LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent
```

**Windows (PowerShell):**
```powershell
$env:LLM_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent"
```

#### Option 3: Docker Compose

Edit `compose.yaml` environment section:

```yaml
environment:
  - LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent
```

### Restart Services After Changing Models

```bash
# Stop existing worker
# Then restart:
.venv\Scripts\python.exe services\forj-worker\worker.py
```

## Getting Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

**Free Tier Limits** (as of 2026):
- **Gemini 2.5 Flash**: 15 requests/minute, 1 million tokens/minute
- **Gemini 2.5 Pro**: 2 requests/minute, 32,000 tokens/minute

## Model Selection Guidelines

| Scenario | Recommended Model | Why |
|----------|------------------|-----|
| Development & Testing | **Gemini 2.5 Flash** | Faster iteration, sufficient quality |
| Production (High Volume) | **Gemini 2.5 Flash** | Better throughput, cost efficient |
| Complex Assessments | **Gemini 2.5 Pro** | Superior reasoning capabilities |
| Budget Conscious | **Gemini 2.5 Flash** | More requests per dollar |
| Quality Critical | **Gemini 2.5 Pro** | Highest quality outputs |

## Code Implementation Details

### Worker Service
- **Location**: `services/forj-worker/app/llm/client.py`
- **Features**:
  - Auto-detects Gemini 2.5 models
  - Optimized configuration for newer models
  - JSON-enforced responses
  - Security: Untrusted input protection

### Edge Function
- **Location**: `supabase/functions/extract-skills/index.ts`
- **Features**:
  - Resume skill extraction
  - Gemini API integration
  - Rate limiting compliance

## Troubleshooting

### Issue: API Key Invalid
**Solution**: Verify your API key in `.env` and ensure it starts with `AI` or similar prefix

### Issue: Rate Limit Exceeded
**Solution**: 
1. Check your usage at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Consider switching to Flash for higher throughput
3. Implement request throttling in high-volume scenarios

### Issue: Model Not Found
**Solution**: Verify the model URL is correctly formatted:
```
https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent
```

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Gemini Models Overview](https://ai.google.dev/models/gemini)
