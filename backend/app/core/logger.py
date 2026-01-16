import sys
from loguru import logger
import os

def setup_logging():
    """Configure logger with JSON rotation"""
    # Remove default handler
    logger.remove()
    
    # Add console handler (Human readable)
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=os.getenv("LOG_LEVEL", "INFO")
    )
    
    # Add file handler (JSON for production tools)
    logger.add(
        "logs/app.log",
        rotation="10 MB",
        retention="10 days",
        level="INFO",
        serialize=True
    )
    
    logger.info("Logging initialized")
