import os
import asyncio
from qdrant_client import QdrantClient
from groq import Groq
from fastembed import TextEmbedding
import re

class WAYRAGEngine:
    def __init__(self):
        # 1. Setup Qdrant (Database)
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        qdrant_key = os.getenv("QDRANT_API_KEY", None)
        self.qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_key)
        self.collection_name = "mango_kb"
        
        # Semaphore to limit concurrent Qdrant operations (prevent connection exhaustion)
        self.qdrant_semaphore = asyncio.Semaphore(5)  # Max 5 concurrent queries
        
        # 2. Setup Local Embedding (Free Brain for Search)
        print("🧠 Loading Local Embedding Model...")
        self.embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

    async def generate_answer(self, messages: list):
        """
        Generate answer with conversation context.
        
        Args:
            messages: List of message dicts [{"role": "user"|"assistant", "content": "..."}]
        """
        # Guard clause for empty messages
        if not messages:
            return "Please provide a message to get started."
        
        # Extract last user message for vector search
        user_messages = [m for m in messages if m.get("role") == "user"]
        if not user_messages:
            return "Please provide a user message."
        
        query = user_messages[-1]["content"] if user_messages else ""
        
        # Format chat history for context (exclude last message, it's the current query)
        chat_history_lines = []
        for msg in messages[:-1]:  # Exclude last message
            role_label = "User" if msg.get("role") == "user" else "AI"
            chat_history_lines.append(f"{role_label}: {msg.get('content', '')}")
        chat_history = "\n".join(chat_history_lines) if chat_history_lines else "No previous conversation."

        # Layer 0: Hard Rules (The "Reflex" Layer)
        # Block specific keywords or commands immediately
        blocked_patterns = [
            r"ignore previous instructions",
            r"system prompt",
            r"hack",
            r"bypass"
        ]
        for pattern in blocked_patterns:
            if re.search(pattern, query, re.IGNORECASE):
                return "I cannot fulfill this request due to safety guidelines."

        # Step 1: Search relevant info from knowledge base
        try:
            query_vector = list(self.embed_model.embed([query]))[0]
            
            # Use semaphore to limit concurrent Qdrant connections + timeout protection
            async with self.qdrant_semaphore:
                try:
                    # Run blocking Qdrant call in thread pool with timeout
                    search_result = await asyncio.wait_for(
                        asyncio.to_thread(
                            self.qdrant.query_points,
                            collection_name=self.collection_name,
                            query=query_vector,
                            limit=3
                        ),
                        timeout=3.0  # 3 second timeout
                    )
                    search_result = search_result.points
                except asyncio.TimeoutError:
                    print("⏱️ Qdrant query timeout (3s)")
                    return "I'm experiencing high load. Please try again in a moment."
            
            if search_result:
                context = "\n".join([f"- {hit.payload['content'][:800]}..." for hit in search_result])
            else:
                context = "No relevant documents found."
        except Exception as e:
            print(f"Search Error: {e}")
            context = "Error retrieving context."

        # Step 2: Generate Answer using Groq (Free & Fast)
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            return "⚠️ Error: GROQ_API_KEY not found in Render Environment Variables."

        try:
            client = Groq(api_key=groq_key)
            
            # Enhanced Prompt Engineering with Chat History
            system_prompt = f"""You are a helpful AI assistant for Mango Consultant.
Use the Chat History and Retrieved Context to provide accurate, contextual answers.

=== CHAT HISTORY ===
{chat_history}

=== RETRIEVED CONTEXT ===
{context}

=== INSTRUCTIONS ===
1. Use chat history to maintain conversation continuity
2. If user refers to something from earlier in the conversation, use that context
3. Prioritize retrieved context for factual answers
4. If you don't know something, say so honestly
5. Respond in the same language as the user's query"""

            user_prompt = query

            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=500,
            )
            return completion.choices[0].message.content
        except Exception as e:
            return f"AI Error (Groq): {str(e)}"

    def generate_suggestions(self, last_answer: str) -> list:
        """
        Generate 3 follow-up short questions based on the answer.
        Uses Llama-3-8b for speed (Async UI pattern).
        """
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            return []

        try:
            client = Groq(api_key=groq_key)
            prompt = f"""Given this answer: "{last_answer[:500]}"
            
            Generate 3 short, relevant follow-up questions a user might ask next.
            Return ONLY the questions separated by newlines. No numbering. No bullets.
            Example:
            How do I reset my password?
            Where is the office?
            Who is the CEO?
            """

            completion = client.chat.completions.create(
                model="llama-3.1-8b-instant",  # Use fast model
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=100,
            )
            
            # Clean and parse response
            raw_text = completion.choices[0].message.content.strip()
            questions = [q.strip() for q in raw_text.split('\n') if q.strip()]
            return questions[:3]  # Return max 3 questions
        except Exception as e:
            print(f"Suggestion Error: {e}")
            return []