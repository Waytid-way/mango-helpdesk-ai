from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from contextlib import asynccontextmanager
from .database import init_db
from .way_rag import WAYRAGEngine

# Global variable to hold the brain
rag_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load Model ONCE when server starts
    global rag_engine
    print("🚀 Booting up FastEmbed Brain...")
    init_db()
    rag_engine = WAYRAGEngine()
    yield
    print("💤 Shutting down...")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Guard clause for empty messages
    if not request.messages:
        return {"response": "Please provide a message."}
    
    # Token safety: limit to last 6 messages
    messages_list = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    chat_history = messages_list[-6:] if len(messages_list) > 6 else messages_list
    
    # Use the pre-loaded brain with conversation context
    response = rag_engine.generate_answer(chat_history)
    return {"response": response}

class SuggestionRequest(BaseModel):
    last_answer: str

@app.post("/api/suggest")
async def suggest(request: SuggestionRequest):
    if not request.last_answer:
        return {"questions": []}
        
    questions = rag_engine.generate_suggestions(request.last_answer)
    return {"questions": questions}