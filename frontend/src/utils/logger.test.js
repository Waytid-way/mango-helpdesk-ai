/**
 * Frontend logger tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger, PerformanceTracker, APILogger } from './logger';

describe('Logger', () => {
  let logger;

  beforeEach(() => {
    logger = new Logger('TestLogger', 'DEBUG');
    logger.clear();
  });

  it('should create logger with name', () => {
    expect(logger.name).toBe('TestLogger');
  });

  it('should log debug messages', () => {
    const entry = logger.debug('Test debug message', { key: 'value' });
    expect(entry.level).toBe('DEBUG');
    expect(entry.message).toBe('Test debug message');
    expect(entry.context.key).toBe('value');
  });

  it('should log info messages', () => {
    const entry = logger.info('Test info message');
    expect(entry.level).toBe('INFO');
    expect(logger.logs.length).toBe(1);
  });

  it('should log warning messages', () => {
    const entry = logger.warn('Test warning');
    expect(entry.level).toBe('WARN');
  });

  it('should log error messages', () => {
    const entry = logger.error('Test error', { error: 'details' });
    expect(entry.level).toBe('ERROR');
    expect(entry.context.error).toBe('details');
  });

  it('should respect log level', () => {
    const infoLogger = new Logger('InfoOnly', 'INFO');
    infoLogger.debug('Should not log');
    infoLogger.info('Should log');

    expect(infoLogger.logs.length).toBe(1);
    expect(infoLogger.logs[0].level).toBe('INFO');
  });

  it('should limit log storage', () => {
    logger.maxLogs = 5;
    for (let i = 0; i < 10; i++) {
      logger.info(`Message ${i}`);
    }
    expect(logger.logs.length).toBe(5);
  });

  it('should filter logs by level', () => {
    logger.debug('Debug');
    logger.info('Info');
    logger.warn('Warn');
    logger.error('Error');

    const errors = logger.getLogs('ERROR');
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('Error');
  });

  it('should clear logs', () => {
    logger.info('Test');
    expect(logger.logs.length).toBe(1);
    logger.clear();
    expect(logger.logs.length).toBe(0);
  });

  it('should export logs as JSON', () => {
    logger.info('Test message');
    const exported = logger.export();
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].message).toBe('Test message');
  });
});

describe('PerformanceTracker', () => {
  let logger;
  let tracker;

  beforeEach(() => {
    logger = new Logger('PerfTest', 'DEBUG');
    tracker = new PerformanceTracker(logger);
  });

  it('should track performance', async () => {
    tracker.start('test-operation');
    await new Promise((resolve) => setTimeout(resolve, 10));
    const duration = tracker.end('test-operation');

    expect(duration).toBeGreaterThan(0);
  });

  it('should warn on missing start mark', () => {
    const duration = tracker.end('nonexistent');
    expect(duration).toBeNull();

    const warnings = logger.getLogs('WARN');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('should remove mark after end', () => {
    tracker.start('test');
    tracker.end('test');
    const duration = tracker.end('test');
    expect(duration).toBeNull();
  });
});

describe('APILogger', () => {
  let logger;
  let apiLogger;

  beforeEach(() => {
    logger = new Logger('APITest', 'DEBUG');
    apiLogger = new APILogger(logger);
  });

  it('should log API request', () => {
    const requestId = apiLogger.logRequest('/api/test', 'GET', null);
    expect(requestId).toContain('req_');

    const logs = logger.getLogs('INFO');
    expect(logs.some((log) => log.message.includes('API Request'))).toBe(true);
  });

  it('should log API response', () => {
    const requestId = apiLogger.logRequest('/api/test', 'POST', { data: 'test' });
    apiLogger.logResponse(requestId, 200, { result: 'success' });

    const logs = logger.getLogs('INFO');
    expect(logs.some((log) => log.message.includes('API Response'))).toBe(true);
  });

  it('should log API error', () => {
    const requestId = apiLogger.logRequest('/api/test', 'GET', null);
    const error = new Error('Network error');
    apiLogger.logError(requestId, error);

    const errors = logger.getLogs('ERROR');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].context.error).toBe('Network error');
  });

  it('should track request duration', async () => {
    const requestId = apiLogger.logRequest('/api/test', 'GET', null);
    await new Promise((resolve) => setTimeout(resolve, 10));
    apiLogger.logResponse(requestId, 200, {});

    const logs = logger.getLogs('INFO');
    const responseLog = logs.find((log) => log.message.includes('API Response'));
    expect(responseLog.context.duration_ms).toBeDefined();
  });
});
