import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
    cleanup();

    // Clear all mocks
    vi.clearAllMocks();
});

// Global fetch mock
global.fetch = vi.fn();

// Reset fetch mock before each test
beforeEach(() => {
    global.fetch.mockClear();
    global.fetch.mockImplementation(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ response: 'Test response from helpdesk AI' }),
        })
    );
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() { return []; }
    unobserve() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    disconnect() { }
    observe() { }
    unobserve() { }
};
