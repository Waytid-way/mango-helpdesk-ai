from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    # Use the pre-loaded brain
    response = rag_engine.generate_answer(request.message)
    return {"response": response}