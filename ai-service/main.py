"""
Builder-AI — FastAPI AI Service
Handles all AI chat requests via local Ollama.
No external AI calls. All inference stays on-premise.

Compatible with Python 3.9+ and pydantic v1.
"""

import os
import httpx
import logging
from typing import Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ─────────────────────────────────────────────────────────────
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "qwen3:8b")
OLLAMA_TIMEOUT  = float(os.getenv("OLLAMA_TIMEOUT_MS", "90000")) / 1000
MAX_PROMPT_LEN  = int(os.getenv("MAX_PROMPT_LEN", "8000"))

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("builder-ai")

# ── Startup / Shutdown ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Builder-AI AI Service starting")
    log.info(f"Ollama URL   : {OLLAMA_BASE_URL}")
    log.info(f"Ollama Model : {OLLAMA_MODEL}")
    log.info(f"External AI  : NONE — all inference is local")
    yield
    log.info("Builder-AI AI Service shutting down")

# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Builder-AI — Local AI Service",
    description="On-premise AI workbench. No cloud AI. All inference via local Ollama.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic v1 Models ────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None

    @validator("message")
    def message_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("message cannot be empty")
        if len(v) > MAX_PROMPT_LEN:
            raise ValueError(f"message exceeds maximum length of {MAX_PROMPT_LEN} characters")
        return v


class ChatResponse(BaseModel):
    response: str
    model: str
    runtime: str = "ollama-local"
    external_ai_calls: int = 0


class StatusResponse(BaseModel):
    status: str
    ollama_connected: bool
    model: str
    ollama_url: str
    external_ai_calls: int = 0
    cloud_requests: int = 0


# ── Ollama helper ─────────────────────────────────────────────────────────────
async def call_ollama(prompt: str, system: Optional[str] = None) -> str:
    """
    Send a prompt to the local Ollama /api/generate endpoint.
    Raises HTTPException with meaningful messages if Ollama is unavailable.
    """
    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    if system:
        payload["system"] = system

    try:
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            r = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            r.raise_for_status()
            data = r.json()
            return data.get("response", "").strip()

    except httpx.ConnectError:
        log.error("Cannot connect to Ollama — is it running?")
        raise HTTPException(
            status_code=503,
            detail=(
                f"Local AI is unavailable. Please start Ollama "
                f"(`ollama serve`) and ensure model '{OLLAMA_MODEL}' is pulled "
                f"(`ollama pull {OLLAMA_MODEL}`)."
            ),
        )
    except httpx.TimeoutException:
        log.error("Ollama request timed out")
        raise HTTPException(
            status_code=504,
            detail=f"Local AI timed out after {int(OLLAMA_TIMEOUT)}s. Try a smaller model or increase OLLAMA_TIMEOUT_MS.",
        )
    except httpx.HTTPStatusError as exc:
        log.error(f"Ollama returned HTTP {exc.response.status_code}: {exc.response.text}")
        raise HTTPException(
            status_code=502,
            detail=f"Ollama error: {exc.response.text}",
        )


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Builder-AI Local AI Service",
        "status": "running",
        "model": OLLAMA_MODEL,
        "runtime": "ollama-local",
        "external_ai_calls": 0,
    }


@app.get("/api/ai/status", response_model=StatusResponse, tags=["Health"])
async def status():
    """Check if Ollama is reachable and return workbench status."""
    connected = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            connected = r.status_code == 200
    except Exception:
        connected = False

    return StatusResponse(
        status="online" if connected else "degraded",
        ollama_connected=connected,
        model=OLLAMA_MODEL,
        ollama_url=OLLAMA_BASE_URL,
        external_ai_calls=0,
        cloud_requests=0,
    )


@app.post("/api/ai/chat", response_model=ChatResponse, tags=["AI"])
async def chat(req: ChatRequest):
    """
    Primary chat endpoint.
    Receives a user message, forwards it to the local Ollama model,
    and returns the response. No data leaves the local machine.
    """
    default_system = (
        "You are Builder AI, a secure on-premise AI assistant for industrial and engineering work. "
        "You help engineers and professionals analyze documents, perform calculations, and answer technical questions. "
        "You are running entirely on the organization's local infrastructure — no data is sent to external AI services. "
        "Be concise, accurate, and professional. If asked for safety-critical engineering decisions, "
        "always recommend that a qualified engineer reviews and approves the output."
    )

    system = req.system_prompt or default_system
    log.info(f"Chat request — model: {OLLAMA_MODEL} | prompt_len: {len(req.message)}")

    response_text = await call_ollama(req.message, system=system)

    log.info(f"Chat response sent — len: {len(response_text)}")

    return ChatResponse(
        response=response_text,
        model=OLLAMA_MODEL,
        runtime="ollama-local",
        external_ai_calls=0,
    )
