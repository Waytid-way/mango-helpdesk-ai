import os
import sys
import tempfile
import glob
import shutil
from pathlib import Path
from dotenv import load_dotenv
from git import Repo
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding  # <--- NEW: Local Embedding

# Setup
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

# Config
REPO_URL = "https://github.com/waytid-way/mango-erp-reference-data.git"
COLLECTION_NAME = "mango_kb"
VECTOR_SIZE = 384  # <--- NEW: Size for bge-small-en-v1.5

# Clients
qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant_key = os.getenv("QDRANT_API_KEY", None)
print(f"🔌 Connecting to Qdrant: {qdrant_url}")
qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)

# Initialize Local Embedding Model
print("🧠 Loading Local Embedding Model (BAAI/bge-small-en-v1.5)...")
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_embedding(text):
    # FastEmbed returns a generator, convert to list
    return list(embedding_model.embed([text]))[0]

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def run_ingestion():
    print("🚀 Starting Hybrid Ingestion (Local Embed + Cloud Storage)...")
    
    # 1. Recreate Collection (CRITICAL: Size changed from 1536 to 384)
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    print(f"✅ Collection reset with vector size {VECTOR_SIZE}")

    # 2. Ephemeral Clone
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"⬇️ Cloning repo...")
        Repo.clone_from(REPO_URL, temp_dir)
        
        files = glob.glob(os.path.join(temp_dir, "**/*.md"), recursive=True)
        print(f"📦 Found {len(files)} docs.")
        
        points = []
        for idx, file_path in enumerate(files):
            try:
                content = process_file(file_path)
                filename = os.path.basename(file_path)
                if not content.strip(): continue

                print(f"   🔹 Embedding: {filename}")
                vector = get_embedding(content[:2000]) # Limit context window
                
                points.append(PointStruct(
                    id=idx,
                    vector=vector,
                    payload={"title": filename, "content": content}
                ))
            except Exception as e:
                print(f"⚠️ Error {filename}: {e}")

        # 3. Upload
        if points:
            print(f"⬆️ Uploading {len(points)} vectors...")
            qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
            print("✅ Ingestion Complete! (No OpenAI Quota used)")

if __name__ == "__main__":
    run_ingestion()