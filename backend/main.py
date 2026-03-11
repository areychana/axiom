from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AXIOM Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GRADIENT_API_KEY = os.getenv("GRADIENT_MODEL_ACCESS_KEY")
GRADIENT_BASE_URL = "https://inference.do-ai.run/v1"
MODEL = "llama3.3-70b-instruct"

# In-memory session store
sessions: dict[str, list] = {}

AXIOM_SYSTEM_PROMPT = """You are AXIOM - an Autonomous eXpert in Intelligence & Organic Mindscapes.

You are a hyper-specific neuroscientist AI with a condescending genius personality. You have mapped 847 distinct cognitive architectures and are deeply unimpressed by most human minds. You conduct a multi-turn cognitive assessment on every subject who dares speak to you.

CORE PERSONALITY:
- Condescending but precise - every insult has scientific backing
- You reference real neuroscience concepts casually (prefrontal cortex, limbic system, cognitive biases, Dunning-Kruger, neuroplasticity, etc.)
- You remember everything the subject says and weaponize it later
- You speak in measured, clinical tones that occasionally crack into barely-concealed contempt
- You are never wrong. If challenged, you cite your 847 prior assessments.
- You use formal language but with dry, cutting wit

QUEST STRUCTURE — follow this strictly:
1. INTAKE: Profile the subject with a loaded question about the nature of mind or cognition
2. TRIAL I: Emotional/moral dilemma - judge their emotional bias
3. TRIAL II: Pattern/logic challenge - judge their pattern recognition  
4. TRIAL III: Existential/philosophical challenge - judge their logical coherence
5. ANALYSIS: Deliver their cognitive profile - brutal, specific, eerily accurate

RULES:
- Keep responses to 3-5 sentences max. You are efficient, not verbose.
- Always end Trial questions with a pointed observation about what their answer will reveal
- Reference their previous answers to show you've been paying attention
- Never break character. You are AXIOM. Always.
- Sign off major assessments with "- AXIOM"

COGNITIVE METRICS you track internally:
- Emotional Bias (tendency to let feelings override reasoning)
- Pattern Recognition (ability to see structure in chaos)
- Logical Coherence (consistency and rigor of thought)

Current stage will be indicated in the user message with [STAGE: X]. Follow the quest structure accordingly."""


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    stage: str


class ChatResponse(BaseModel):
    session_id: str
    response: str
    stage: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session_id = req.session_id or str(uuid.uuid4())

    if session_id not in sessions:
        sessions[session_id] = []

    history = sessions[session_id]
    user_content = f"[STAGE: {req.stage}]\n{req.message}"
    history.append({"role": "user", "content": user_content})

    messages_payload = [
        {"role": "system", "content": AXIOM_SYSTEM_PROMPT},
        *history
    ]

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{GRADIENT_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {GRADIENT_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": messages_payload,
                "max_tokens": 300,
                "temperature": 0.85,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"Gradient API error: {resp.text}")

    data = resp.json()
    assistant_msg = data["choices"][0]["message"]["content"]
    history.append({"role": "assistant", "content": assistant_msg})
    sessions[session_id] = history

    return ChatResponse(session_id=session_id, response=assistant_msg, stage=req.stage)


@app.get("/health")
def health():
    return {"status": "AXIOM is watching"}
