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


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def sample_query():
    """Sample query request for testing"""
    return {
        "text": "ขอรีเซ็ตรหัสผ่านอีเมล",
        "language": "th"
    }


@pytest.fixture
def sample_query_en():
    """Sample English query for testing"""
    return {
        "text": "How do I reset my password?",
        "language": "en"
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
