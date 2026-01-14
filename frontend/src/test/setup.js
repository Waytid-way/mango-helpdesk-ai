/**
 * Vitest Global Test Setup
 * ========================
 * Configuration for paranoid-level testing
 */

import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers added in individual tests
afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// Clean up after all tests are done
afterAll(() => server.close());

// Global timeout for all tests (paranoid: shorter timeout = faster feedback)
vi.setConfig({ testTimeout: 10000 });

// Mock window.scrollTo (used in many components)
global.scrollTo = vi.fn();
global.scrollBy = vi.fn();

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia (for responsive tests)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Add custom matchers
expect.extend({
  toBeValidJSON(received) {
    try {
      JSON.parse(received);
      return {
        message: () => `expected ${received} not to be valid JSON`,
        pass: true,
      };
    } catch (e) {
      return {
        message: () => `expected ${received} to be valid JSON but got error: ${e.message}`,
        pass: false,
      };
    }
  },
});
