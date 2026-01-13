"""
Logger utility tests
Tests logging functionality and configuration
"""
import pytest
import logging
import json
from pathlib import Path
from app.utils.logger import setup_logger, RequestLogger, log_performance


class TestLoggerSetup:
    """Test logger configuration"""
    
    def test_logger_creation(self):
        """Test logger can be created"""
        logger = setup_logger("test_logger", level="DEBUG")
        assert logger is not None
        assert logger.name == "test_logger"
        assert logger.level == logging.DEBUG
    
    def test_logger_levels(self):
        """Test different log levels"""
        for level in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
            logger = setup_logger(f"test_{level}", level=level)
            assert logger.level == getattr(logging, level)
    
    def test_logger_has_handlers(self):
        """Test logger has console and file handlers"""
        logger = setup_logger("test_handlers")
        assert len(logger.handlers) >= 2  # Console + File + Error handlers


class TestRequestLogger:
    """Test request logging context manager"""
    
    def test_request_logger_context(self):
        """Test request logger context manager"""
        logger = setup_logger("test_request", level="DEBUG")
        
        with RequestLogger(logger, "test_req_123", "/api/test") as req_log:
            assert req_log.request_id == "test_req_123"
            assert req_log.endpoint == "/api/test"
            assert req_log.start_time is not None
    
    def test_request_logger_exception_handling(self):
        """Test request logger handles exceptions"""
        logger = setup_logger("test_exception", level="DEBUG")
        
        with pytest.raises(ValueError):
            with RequestLogger(logger, "test_req_error", "/api/error"):
                raise ValueError("Test error")


class TestPerformanceDecorator:
    """Test performance logging decorator"""
    
    def test_performance_decorator_success(self):
        """Test performance decorator on successful function"""
        logger = setup_logger("test_perf", level="DEBUG")
        
        @log_performance(logger)
        def test_function():
            return "success"
        
        result = test_function()
        assert result == "success"
    
    def test_performance_decorator_exception(self):
        """Test performance decorator on failed function"""
        logger = setup_logger("test_perf_error", level="DEBUG")
        
        @log_performance(logger)
        def failing_function():
            raise RuntimeError("Test error")
        
        with pytest.raises(RuntimeError):
            failing_function()


class TestLogOutput:
    """Test log output format and content"""
    
    def test_log_files_created(self):
        """Test that log files are created"""
        logger = setup_logger("test_files")
        logger.info("Test message")
        
        log_dir = Path(__file__).parent.parent / "logs"
        assert (log_dir / "app.log").exists()
        assert (log_dir / "error.log").exists()
    
    def test_error_log_only_errors(self):
        """Test error log only contains errors"""
        logger = setup_logger("test_error_only")
        
        # Clear error log
        log_dir = Path(__file__).parent.parent / "logs"
        error_log = log_dir / "error.log"
        
        # Log different levels
        logger.info("Info message")
        logger.warning("Warning message")
        logger.error("Error message")
        
        # Error log should only have errors
        if error_log.exists():
            with open(error_log, 'r') as f:
                lines = f.readlines()
                if lines:
                    last_line = json.loads(lines[-1])
                    assert last_line["level"] == "ERROR"
