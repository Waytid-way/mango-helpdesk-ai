/**
 * Frontend logging utility for Mango Helpdesk AI
 * Provides structured logging with levels and context tracking
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  constructor(name, level = 'INFO') {
    this.name = name;
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  _log(level, message, context = {}) {
    if (LOG_LEVELS[level] < this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      logger: this.name,
      message,
      context,
    };

    // Store in memory
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest
    }

    // Console output with colors
    const emoji = {
      DEBUG: '🔍',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌',
    };

    const color = {
      DEBUG: 'color: gray',
      INFO: 'color: blue',
      WARN: 'color: orange',
      ERROR: 'color: red',
    };

    console.log(
      `%c${emoji[level]} [${level}] ${this.name}`,
      color[level],
      message,
      context
    );

    // Send to backend for persistence (optional)
    if (level === 'ERROR' || level === 'WARN') {
      this._sendToBackend(logEntry).catch(() => {
        // Silently fail if backend is unavailable
      });
    }

    return logEntry;
  }

  async _sendToBackend(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      // Don't log this to prevent infinite loop
    }
  }

  debug(message, context) {
    return this._log('DEBUG', message, context);
  }

  info(message, context) {
    return this._log('INFO', message, context);
  }

  warn(message, context) {
    return this._log('WARN', message, context);
  }

  error(message, context) {
    return this._log('ERROR', message, context);
  }

  // Get logs for debugging
  getLogs(level = null) {
    if (!level) return this.logs;
    return this.logs.filter((log) => log.level === level);
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Export logs as JSON
  export() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Download logs
  download() {
    const blob = new Blob([this.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${this.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Performance tracker
export class PerformanceTracker {
  constructor(logger) {
    this.logger = logger;
    this.marks = new Map();
  }

  start(name) {
    this.marks.set(name, performance.now());
    this.logger.debug(`Performance tracking started: ${name}`);
  }

  end(name) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      this.logger.warn(`No start mark found for: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    this.logger.info(`Performance: ${name}`, {
      duration_ms: duration.toFixed(2),
    });

    return duration;
  }
}

// Error boundary logger
export class ErrorLogger {
  constructor(logger) {
    this.logger = logger;
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.logger.error('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });
  }

  logComponentError(error, errorInfo) {
    this.logger.error('React Component Error', {
      error: error.toString(),
      errorInfo: errorInfo,
      componentStack: errorInfo?.componentStack,
    });
  }
}

// API call logger
export class APILogger {
  constructor(logger) {
    this.logger = logger;
    this.performance = new PerformanceTracker(logger);
  }

  logRequest(url, method, data) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.performance.start(requestId);

    this.logger.info(`API Request: ${method} ${url}`, {
      requestId,
      method,
      url,
      data: data ? JSON.stringify(data).substring(0, 100) : null,
    });

    return requestId;
  }

  logResponse(requestId, status, data) {
    const duration = this.performance.end(requestId);

    this.logger.info(`API Response`, {
      requestId,
      status,
      duration_ms: duration?.toFixed(2),
      success: status >= 200 && status < 300,
    });
  }

  logError(requestId, error) {
    this.performance.end(requestId);

    this.logger.error(`API Error`, {
      requestId,
      error: error.message,
      stack: error.stack,
    });
  }
}

// Create default logger instance
const logger = new Logger('MangoHelpdeskAI', 'INFO');
const performanceTracker = new PerformanceTracker(logger);
const errorLogger = new ErrorLogger(logger);
const apiLogger = new APILogger(logger);

export { logger, performanceTracker, errorLogger, apiLogger, Logger };
export default logger;
