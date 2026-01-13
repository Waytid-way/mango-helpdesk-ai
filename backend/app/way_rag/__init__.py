import os
from qdrant_client import QdrantClient
from openai import OpenAI
from sqlmodel import Session, select
from ..database import engine, SystemConfig
from fastembed import TextEmbedding # <--- NEW

class WAYRAGEngine:
    def __init__(self):
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        qdrant_key = os.getenv("QDRANT_API_KEY", None)
        self.qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)
        self.collection_name = "mango_kb"
        
        # Load Local Model (Cached)
        print("🧠 Loading Retrieval Model...")
        self.embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

    def _get_config(self):
        with Session(engine) as session:
            return session.exec(select(SystemConfig)).first()

    def generate_answer(self, query):
        config = self._get_config()
        if not config or "CHANGE_ME" in config.openai_api_key:
            return "⚠️ System Config Error: Check API Key."

        # 1. Local Embedding (Free & Fast)
        try:
            query_vector = list(self.embed_model.embed([query]))[0]
            
            search_result = self.qdrant.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=3
            )
            
            if search_result:
                context = "\n".join([f"- {hit.payload['content'][:500]}..." for hit in search_result])
            else:
                context = "No relevant documents found."
        except Exception as e:
            print(f"Search Error: {e}")
            context = "Error retrieving context."

        # 2. Generation (OpenAI - Only step that costs money)
        client = OpenAI(api_key=config.openai_api_key)
        prompt = f"{config.system_prompt}\n\n[Context]\n{context}\n\n[Query]\n{query}"

        try:
            response = client.chat.completions.create(
                model=config.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=config.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"