import os
import sys
import tempfile
import shutil
import glob
from pathlib import Path
from dotenv import load_dotenv
from git import Repo  # pip install GitPython
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import OpenAI

# 1. Setup Environment
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.append(str(backend_dir))
load_dotenv(backend_dir / ".env")

# External Repo Config
REPO_URL = "https://github.com/waytid-way/mango-erp-reference-data.git"
COLLECTION_NAME = "mango_kb"

# Clients
# Note: For Production, these will come from Render's Env Vars
qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
qdrant_key = os.getenv("QDRANT_API_KEY", None)
openai_key = os.getenv("OPENAI_API_KEY")

print(f"🔌 Connecting to Qdrant at: {qdrant_url}")
qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)
client = OpenAI(api_key=openai_key)

def get_embedding(text):
    text = text.replace("\n", " ")
    return client.embeddings.create(input=[text], model="text-embedding-3-small").data[0].embedding

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

def run_ingestion():
    print("🚀 Starting Advanced Ingestion (Ephemeral Mode)...")
    
    # Create Collection
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    )
    
    # 2. Ephemeral Clone Strategy
    # Create a temporary directory that auto-deletes when done
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"⬇️ Cloning {REPO_URL} into temporary storage...")
        try:
            Repo.clone_from(REPO_URL, temp_dir)
            print("✅ Clone successful.")
        except Exception as e:
            print(f"❌ Clone failed: {e}")
            return

        # 3. Walk through files
        points = []
        # Find all Markdown files recursively
        files = glob.glob(os.path.join(temp_dir, "**/*.md"), recursive=True)
        print(f"📦 Found {len(files)} markdown documents.")

        for idx, file_path in enumerate(files):
            try:
                content = process_file(file_path)
                filename = os.path.basename(file_path)
                
                # Skip empty files or README if needed
                if not content.strip(): continue

                print(f"   🔹 Processing: {filename}")
                
                # Embedding
                vector = get_embedding(content[:8000]) # Truncate for safety
                
                points.append(PointStruct(
                    id=idx,
                    vector=vector,
                    payload={
                        "title": filename,
                        "content": content,
                        "source": "mango-erp-reference-data"
                    }
                ))
            except Exception as e:
                print(f"   ⚠️ Failed to process {file_path}: {e}")

        # 4. Upload to Qdrant
        if points:
            print(f"⬆️ Uploading {len(points)} vectors to Qdrant...")
            qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
            print("✅ Ingestion Complete!")
        else:
            print("⚠️ No valid data found to ingest.")
            
    print("🧹 Temporary directory cleaned up automatically.")

if __name__ == "__main__":
    if not openai_key:
        print("❌ Error: OPENAI_API_KEY is missing.")
    else:
        run_ingestion()
