"""
Pytest configuration and fixtures
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set default environment variables for testing
os.environ.setdefault('GROQ_API_KEY', 'test_key_for_ci')
os.environ.setdefault('QDRANT_URL', 'http://localhost:6333')
os.environ.setdefault('QDRANT_API_KEY', '')

from app.main import app

# Mock RAG engine for testing
class MockRAGEngine:
    async def generate_answer(self, chat_history):
        """Mock generate_answer method"""
        return "This is a test response from the helpdesk AI."
    
    def generate_suggestions(self, last_answer):
        """Mock generate_suggestions method"""
        return ["How do I reset my password?", "Where can I find documentation?"]

# Mock WUT Classifier for testing
class MockWUTClassifier:
    async def classify(self, text: str):
        """Mock classify method that returns WUT classification response"""
        return {
            "department": "IT",
            "intent": "question",
            "urgency": "medium",
            "action": "AUTO_RESOLVE",
            "confidence": 0.95
        }

@pytest.fixture
def client():
    """FastAPI test client with mocked RAG engine and WUT classifier"""
    # Mock the RAG engine and WUT classifier to avoid needing Qdrant/Groq in tests
    import app.main as main_module
    main_module.rag_engine = MockRAGEngine()
    main_module.wut_classifier = MockWUTClassifier()
    return TestClient(app)


@pytest.fixture
def sample_query():
    """Sample query request for testing"""
    return {
        "messages": [
            {
                "role": "user",
                "content": "ขอรีเซ็ตรหัสผ่านอีเมล"
            }
        ]
    }


@pytest.fixture
def sample_query_en():
    """Sample English query for testing"""
    return {
        "messages": [
            {
                "role": "user",
                "content": "How do I reset my password?"
            }
        ]
    }


@pytest.fixture
def mock_knowledge_base():
    """Mock knowledge base data"""
    return [
        {
            "id": "IT-001",
            "title": "Password Reset",
            "department": "IT",
            "content": "Password reset instructions...",
            "keywords": ["password", "reset", "รหัสผ่าน"]
        },
        {
            "id": "HR-050",
            "title": "Leave Request",
            "department": "HR",
            "content": "Leave request process...",
            "keywords": ["leave", "vacation", "ลา"]
        }
    ]
