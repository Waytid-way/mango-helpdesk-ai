from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from contextlib import asynccontextmanager
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .database import init_db
from .way_rag import WAYRAGEngine
from .wut_orchestrator import WUTClassifier
from .core.logger import setup_logging
from loguru import logger

# Global variable to hold the brain
rag_engine = None
wut_classifier = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup Logging
    setup_logging()
    
    # Load Model ONCE when server starts
    global rag_engine, wut_classifier
    logger.info("🚀 Booting up FastEmbed Brain...")
    await init_db()
    rag_engine = WAYRAGEngine()
    wut_classifier = WUTClassifier()
    yield
    logger.info("💤 Shutting down...")

app = FastAPI(lifespan=lifespan)

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Setup - Secure by default
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
logger.info(f"CORS Allowed Origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - service info"""
    return {
        "service": "Mango Helpdesk AI",
        "status": "online",
        "version": "1.0.0",
        "architecture": "WUT + WAY"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

from enum import Enum
from pydantic import field_validator

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v):
        """Validate content is not empty or whitespace only"""
        if not v or not v.strip():
            raise ValueError('Content cannot be empty or whitespace only')
        if len(v) > 50000:  # 50KB limit per message
            raise ValueError('Content exceeds maximum length of 50,000 characters')
        return v.strip()

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    
    @field_validator('messages')
    @classmethod
    def validate_messages(cls, v):
        """Validate messages array is not empty and within limits"""
        if not v or len(v) == 0:
            raise ValueError('Messages array cannot be empty')
        if len(v) > 100:
            raise ValueError('Too many messages. Maximum is 100.')
        return v

@app.post("/api/chat")
@limiter.limit("10/minute")
async def chat(request: Request, chat_request: ChatRequest):
    # Guard clause for empty messages (handled by Pydantic now)
    # Token safety: limit to last 6 messages
    messages_list = [{"role": msg.role.value, "content": msg.content} for msg in chat_request.messages]
    chat_history = messages_list[-6:] if len(messages_list) > 6 else messages_list
    
    # Use the pre-loaded brain with conversation context (now async)
    classification = await wut_classifier.classify(chat_request.messages[-1].content)
    logger.info(f"🧠 WUT Classification: {classification}")
    
    response = await rag_engine.generate_answer(chat_history)
    return {
        "response": response,
        "meta": classification
    }

class SuggestionRequest(BaseModel):
    last_answer: str

@app.post("/api/suggest")
async def suggest(request: SuggestionRequest):
    if not request.last_answer:
        return {"questions": []}
        
    questions = rag_engine.generate_suggestions(request.last_answer)
    return {"questions": questions}