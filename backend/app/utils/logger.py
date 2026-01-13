"""
Centralized logging configuration for Mango Helpdesk AI
Supports structured logging with context tracking for debugging
"""
import logging
import sys
import json
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path

# Create logs directory
LOG_DIR = Path(__file__).parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        if hasattr(record, "context"):
            log_data["context"] = record.context
            
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data, ensure_ascii=False)


def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """
    Setup logger with both console and file handlers
    
    Args:
        name: Logger name (usually __name__)
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Console Handler (Human-readable)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_format = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File Handler (JSON format for analysis)
    file_handler = logging.FileHandler(LOG_DIR / "app.log", encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    # Error File Handler (Separate error log)
    error_handler = logging.FileHandler(LOG_DIR / "error.log", encoding='utf-8')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(JSONFormatter())
    logger.addHandler(error_handler)
    
    return logger


class RequestLogger:
    """Context manager for logging request lifecycle"""
    
    def __init__(self, logger: logging.Logger, request_id: str, endpoint: str):
        self.logger = logger
        self.request_id = request_id
        self.endpoint = endpoint
        self.start_time = None
        
    def __enter__(self):
        self.start_time = datetime.utcnow()
        self.logger.info(
            f"Request started: {self.endpoint}",
            extra={"request_id": self.request_id, "context": {"endpoint": self.endpoint}}
        )
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration_ms = (datetime.utcnow() - self.start_time).total_seconds() * 1000
        
        if exc_type is None:
            self.logger.info(
                f"Request completed: {self.endpoint}",
                extra={
                    "request_id": self.request_id,
                    "duration_ms": round(duration_ms, 2),
                    "context": {"endpoint": self.endpoint, "status": "success"}
                }
            )
        else:
            self.logger.error(
                f"Request failed: {self.endpoint} - {exc_val}",
                extra={
                    "request_id": self.request_id,
                    "duration_ms": round(duration_ms, 2),
                    "context": {"endpoint": self.endpoint, "status": "error", "error": str(exc_val)}
                },
                exc_info=True
            )
        return False  # Don't suppress exception


# Performance tracking decorator
def log_performance(logger: logging.Logger):
    """Decorator to log function execution time"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start = datetime.utcnow()
            try:
                result = func(*args, **kwargs)
                duration_ms = (datetime.utcnow() - start).total_seconds() * 1000
                logger.debug(
                    f"Function {func.__name__} completed",
                    extra={"duration_ms": round(duration_ms, 2), "context": {"function": func.__name__}}
                )
                return result
            except Exception as e:
                duration_ms = (datetime.utcnow() - start).total_seconds() * 1000
                logger.error(
                    f"Function {func.__name__} failed: {str(e)}",
                    extra={"duration_ms": round(duration_ms, 2), "context": {"function": func.__name__}},
                    exc_info=True
                )
                raise
        return wrapper
    return decorator
