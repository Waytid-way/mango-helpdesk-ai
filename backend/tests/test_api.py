"""
API endpoint tests
Tests all API endpoints for correct responses and error handling
"""
import pytest
from fastapi import status


class TestHealthEndpoints:
    """Test health check and status endpoints"""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns correct service info"""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["service"] == "Mango Helpdesk AI"
        assert data["status"] == "online"
        assert data["version"] == "1.0.0"
        assert data["architecture"] == "WUT + WAY"
    
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "healthy"


class TestQueryEndpoint:
    """Test main query processing endpoint"""
    
    def test_query_success_thai(self, client, sample_query):
        """Test successful query processing with Thai text"""
        response = client.post("/api/query", json=sample_query)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "request_id" in data
        assert "department" in data
        assert "intent" in data
        assert "urgency" in data
        assert "confidence" in data
        assert "answer" in data
        assert "action" in data
        
        # Verify data types
        assert isinstance(data["confidence"], float)
        assert 0 <= data["confidence"] <= 1
        assert data["request_id"].startswith("req_")
    
    def test_query_success_english(self, client, sample_query_en):
        """Test successful query processing with English text"""
        response = client.post("/api/query", json=sample_query_en)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "answer" in data
        assert data["language"] == "en" or "language" not in data
    
    def test_query_default_language(self, client):
        """Test query with default language (Thai)"""
        response = client.post("/api/query", json={"text": "test query"})
        
        assert response.status_code == status.HTTP_200_OK
        # Should default to Thai if not specified
    
    def test_query_empty_text(self, client):
        """Test query with empty text should fail validation"""
        response = client.post("/api/query", json={"text": ""})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_missing_text(self, client):
        """Test query without text field should fail"""
        response = client.post("/api/query", json={"language": "th"})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_invalid_json(self, client):
        """Test query with invalid JSON"""
        response = client.post(
            "/api/query",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_long_text(self, client):
        """Test query with very long text"""
        long_text = "ทดสอบ" * 1000  # Very long text
        response = client.post("/api/query", json={"text": long_text, "language": "th"})
        
        # Should still process (or handle gracefully)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE]
    
    def test_query_special_characters(self, client):
        """Test query with special characters"""
        special_text = "Test @#$%^&*() การทดสอบ 🚀 emoji"
        response = client.post("/api/query", json={"text": special_text})
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_query_response_fields(self, client, sample_query):
        """Test all expected fields are present in response"""
        response = client.post("/api/query", json=sample_query)
        data = response.json()
        
        required_fields = [
            "request_id", "department", "intent",
            "urgency", "confidence", "answer", "action"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
    
    def test_query_confidence_range(self, client, sample_query):
        """Test confidence score is within valid range"""
        response = client.post("/api/query", json=sample_query)
        data = response.json()
        
        assert 0.0 <= data["confidence"] <= 1.0


class TestCORS:
    """Test CORS configuration"""
    
    def test_cors_headers_present(self, client):
        """Test CORS headers are properly set"""
        response = client.options(
            "/api/query",
            headers={"Origin": "http://localhost:3000"}
        )
        
        # Should have CORS headers
        assert "access-control-allow-origin" in response.headers


class TestErrorHandling:
    """Test error handling and edge cases"""
    
    def test_404_on_invalid_endpoint(self, client):
        """Test 404 on non-existent endpoint"""
        response = client.get("/api/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_405_on_wrong_method(self, client):
        """Test 405 on wrong HTTP method"""
        response = client.get("/api/query")  # Should be POST
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
