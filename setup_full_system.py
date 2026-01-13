import os
import subprocess
import sys
from pathlib import Path
from textwrap import dedent

# --- Helper Function ---
def write_file(path, content):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(dedent(content).strip())
    print(f"✅ Created: {path}")

# --- 1. Install Dependencies ---
print("📦 Installing dependencies...")
subprocess.check_call([
    sys.executable, "-m", "pip", "install",
    "openai", "qdrant-client", "sqlmodel", "uvicorn", "fastapi",
    "python-multipart", "passlib[bcrypt]", "python-jose", "python-dotenv"
])

# --- 2. Define File Contents ---

# File: backend/app/models.py
models_code = """
from typing import Optional
from sqlmodel import Field, SQLModel

class SystemConfig(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    openai_api_key: str = Field(default="CHANGE_ME")
    model_name: str = Field(default="gpt-4o-mini")
    temperature: float = Field(default=0.3)
    system_prompt: str = Field(default="You are a helpful assistant for Mango Inc.")
    admin_password_hash: str = Field(default="mock_hash")
"""

# File: backend/app/database.py
database_code = """
from sqlmodel import SQLModel, create_engine, Session, select
from .models import SystemConfig
from passlib.context import CryptContext
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sqlite_file_name = BASE_DIR / "rag_config.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        config = session.exec(select(SystemConfig)).first()
        if not config:
            print("⚙️ Seeding default config...")
            default_hash = pwd_context.hash("admin123")
            default_config = SystemConfig(
                openai_api_key="CHANGE_ME_IN_ADMIN_PANEL",
                model_name="gpt-4o-mini",
                system_prompt="You are a friendly IT Helpdesk AI for Mango Inc.",
                admin_password_hash=default_hash
            )
            session.add(default_config)
            session.commit()
"""

# File: backend/app/way_rag/__init__.py
rag_engine_code = """
import os
from qdrant_client import QdrantClient
from openai import OpenAI
from sqlmodel import Session, select
from ..database import engine, SystemConfig

class WAYRAGEngine:
    def __init__(self):
        # Default to localhost
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant = QdrantClient(url=qdrant_url)
        self.collection_name = "mango_kb"

    def _get_config(self):
        with Session(engine) as session:
            return session.exec(select(SystemConfig)).first()

    def generate_answer(self, query):
        config = self._get_config()
        if not config.openai_api_key or "CHANGE_ME" in config.openai_api_key:
            return "⚠️ System not configured. Please login to Admin Panel to set API Key."

        client = OpenAI(api_key=config.openai_api_key)
        # Mock retrieval for now
        context = "No relevant documents found yet. (Ingestion needed)"
        full_prompt = f"{config.system_prompt}\\n\\n[Context]\\n{context}\\n\\n[User Query]\\n{query}"

        try:
            response = client.chat.completions.create(
                model=config.model_name,
                messages=[{"role": "user", "content": full_prompt}],
                temperature=config.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"
"""

# File: backend/app/main.py
main_api_code = """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .database import init_db
from .way_rag import WAYRAGEngine

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    engine = WAYRAGEngine()
    response = engine.generate_answer(request.message)
    return {"response": response}
"""

# --- 3. Execute File Creation ---
print("🚀 Generating System Files...")
write_file("backend/app/__init__.py", "")
write_file("backend/app/models.py", models_code)
write_file("backend/app/database.py", database_code)
write_file("backend/app/way_rag/__init__.py", rag_engine_code)
write_file("backend/app/main.py", main_api_code)
print("✅ System Setup Complete!")