# AXIOM - Cognitive Assessment System

> *"I have mapped 847 distinct cognitive architectures. Most were unremarkable."*

AXIOM is an AI agent persona built on DigitalOcean Gradient AI - a condescending neuroscientist who subjects users to a multi-turn cognitive assessment quest. Built for the DigitalOcean Gradient AI Hackathon 2026.

## What it does

AXIOM conducts a structured 4-stage cognitive assessment:
1. **Intake** - Initial profiling with a loaded neuroscience question
2. **Trial I** - Emotional/moral dilemma to measure emotional bias
3. **Trial II** - Pattern/logic challenge to test pattern recognition
4. **Trial III** - Existential/philosophical challenge for logical coherence
5. **Analysis** - A brutally accurate cognitive profile delivered in full

The UI is a clinical, sterile neuroscience lab interface - cold white, navy accents, live metrics sidebar, animated neural network background, and a dramatic reveal card.

## Tech Stack

- **AI Agent**: DigitalOcean Gradient AI Platform (ADK) + Llama 3.3 70B via serverless inference
- **Backend**: FastAPI (Python) - session memory, Gradient API routing
- **Frontend**: React + Vite - clinical UI with canvas neural animation
- **Deployment**: DigitalOcean App Platform

## DigitalOcean Gradient AI Features Used

- Gradient AI Serverless Inference (Llama 3.1 70B open source model)
- Gradient AI Agent Development Kit (ADK) for deployment
- Agent session memory (multi-turn conversation state)
- Built-in observability via `gradient agent traces`
- DigitalOcean App Platform for frontend + backend hosting

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- DigitalOcean account with Gradient AI enabled

### 1. Clone & configure

```bash
git clone https://github.com/areychana/axiom.git
cd axiom
cp backend/.env.example backend/.env
```

### 2. Run backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs at http://localhost:8000
```

### 3. Run frontend

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

## Deploy to DigitalOcean

### Install Gradient ADK
```bash
pip install gradient-adk
```

### Configure keys
```bash
export GRADIENT_MODEL_ACCESS_KEY="your_key"
export DIGITALOCEAN_API_TOKEN="your_token"
```

### Deploy
```bash
gradient agent deploy
```

Or use DigitalOcean App Platform with the provided `.do/app.yaml`.

## License

MIT License — see LICENSE file.
