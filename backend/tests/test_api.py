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
        response = client.post("/api/chat", json=sample_query)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure (new API returns simple response)
        assert "response" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
    
    def test_query_success_english(self, client, sample_query_en):
        """Test successful query processing with English text"""
        response = client.post("/api/chat", json=sample_query_en)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "response" in data
        assert isinstance(data["response"], str)
    
    def test_query_default_language(self, client):
        """Test query with default language"""
        response = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": "test query"}]
        })
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "response" in data
    
    def test_query_empty_text(self, client):
        """Test query with empty text should fail validation"""
        response = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": ""}]
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_missing_text(self, client):
        """Test query without messages should fail"""
        response = client.post("/api/chat", json={"messages": []})
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_invalid_json(self, client):
        """Test query with invalid JSON"""
        response = client.post(
            "/api/chat",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_query_long_text(self, client):
        """Test query with very long text"""
        long_text = "ทดสอบ" * 1000  # Very long text
        response = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": long_text}]
        })
        
        # Should still process (or handle gracefully)
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, status.HTTP_422_UNPROCESSABLE_ENTITY]
    
    def test_query_special_characters(self, client):
        """Test query with special characters"""
        special_text = "Test @#$%^&*() การทดสอบ emoji"
        response = client.post("/api/chat", json={
            "messages": [{"role": "user", "content": special_text}]
        })
        
        assert response.status_code == status.HTTP_200_OK
    
    def test_query_response_fields(self, client, sample_query):
        """Test expected fields are present in response"""
        response = client.post("/api/chat", json=sample_query)
        data = response.json()
        
        # New API returns simple response field
        assert "response" in data, "Missing required field: response"
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0
    
    def test_query_confidence_range(self, client, sample_query):
        """Test response is valid string"""
        response = client.post("/api/chat", json=sample_query)
        data = response.json()
        
        assert "response" in data
        assert isinstance(data["response"], str)
        assert len(data["response"]) > 0


class TestCORS:
    """Test CORS configuration"""
    
    def test_cors_headers_present(self, client):
        """Test CORS headers are properly set"""
        response = client.options(
            "/api/chat",
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
        response = client.get("/api/chat")  # Should be POST
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
