from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import time
from dotenv import load_dotenv
from app.utils.logger import setup_logger, RequestLogger

load_dotenv()

# Setup logger
logger = setup_logger(__name__, level=os.getenv("LOG_LEVEL", "INFO"))

app = FastAPI(
    title="Mango Helpdesk AI - Backend API",
    description="WUT + WAY Architecture Backend",
    version="1.0.0"
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = f"req_{os.urandom(4).hex()}"
    start_time = time.time()
    
    logger.info(
        f"Incoming request: {request.method} {request.url.path}",
        extra={
            "request_id": request_id,
            "context": {
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host if request.client else "unknown"
            }
        }
    )
    
    # Store request_id for use in endpoints
    request.state.request_id = request_id
    
    try:
        response = await call_next(request)
        duration_ms = (time.time() - start_time) * 1000
        
        logger.info(
            f"Request completed: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "duration_ms": round(duration_ms, 2),
                "context": {
                    "status_code": response.status_code,
                    "method": request.method,
                    "path": request.url.path
                }
            }
        )
        return response
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(
            f"Request failed: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "duration_ms": round(duration_ms, 2),
                "context": {"error": str(e), "method": request.method, "path": request.url.path}
            },
            exc_info=True
        )
        raise

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QueryRequest(BaseModel):
    text: str
    language: Optional[str] = "th"
    
    @property
    def text_stripped(self) -> str:
        return self.text.strip()
    
    def model_post_init(self, __context) -> None:
        # Validate text is not empty after stripping
        if not self.text.strip():
            raise ValueError("text cannot be empty")

class QueryResponse(BaseModel):
    request_id: str
    department: str
    intent: str
    urgency: str
    confidence: float
    answer: str
    action: str
    language: Optional[str] = None
    doc_ref: Optional[str] = None

# Health Check
@app.get("/")
async def root():
    logger.debug("Root endpoint accessed")
    return {
        "service": "Mango Helpdesk AI",
        "status": "online",
        "version": "1.0.0",
        "architecture": "WUT + WAY"
    }

@app.get("/health")
async def health_check():
    logger.debug("Health check performed")
    return {"status": "healthy"}

# Main Query Endpoint
@app.post("/api/query", response_model=QueryResponse)
async def process_query(query: QueryRequest, request: Request):
    """
    Main endpoint for processing user queries through WUT + WAY architecture.
    
    Flow:
    1. WUT Classifier: Determines department, intent, urgency
    2. WAY RAG Engine: Searches knowledge base and generates answer
    3. WUT Decision Engine: Applies business rules and decides action
    """
    request_id = getattr(request.state, "request_id", f"req_{os.urandom(4).hex()}")
    
    logger.info(
        f"Processing query",
        extra={
            "request_id": request_id,
            "context": {
                "query_text": query.text[:100],  # Log first 100 chars
                "language": query.language
            }
        }
    )
    
    try:
        # TODO: Implement actual WUT + WAY logic
        # For now, return a mock response
        
        logger.debug(
            "WUT classification started",
            extra={"request_id": request_id, "context": {"text_length": len(query.text)}}
        )
        
        # Simulate processing
        response = QueryResponse(
            request_id=request_id,
            department="IT",
            intent="question",
            urgency="low",
            confidence=0.85,
            answer="This is a mock response. Implement WUT/WAY logic here.",
            action="AUTO_RESOLVE",
            language=query.language,
            doc_ref="IT-001"
        )
        
        logger.info(
            f"Query processed successfully",
            extra={
                "request_id": request_id,
                "context": {
                    "department": response.department,
                    "confidence": response.confidence,
                    "action": response.action
                }
            }
        )
        
        return response
        
    except Exception as e:
        logger.error(
            f"Query processing failed: {str(e)}",
            extra={"request_id": request_id, "context": {"error": str(e)}},
            exc_info=True
        )
        raise

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
