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
        full_prompt = f"{config.system_prompt}\n\n[Context]\n{context}\n\n[User Query]\n{query}"

        try:
            response = client.chat.completions.create(
                model=config.model_name,
                messages=[{"role": "user", "content": full_prompt}],
                temperature=config.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"