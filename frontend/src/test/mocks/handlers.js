/**
 * MSW Mock Handlers
 * =================
 * Mock API responses for isolated testing
 */

import { http, HttpResponse } from 'msw';

export const handlers = [
    // Success: Normal chat response
    http.post('/api/chat', async ({ request }) => {
        const body = await request.json();

        // Validate request structure
        if (!body.messages || !Array.isArray(body.messages)) {
            return HttpResponse.json(
                { error: 'Invalid messages format' },
                { status: 400 }
            );
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 100));

        return HttpResponse.json({
            response: 'This is a mocked AI response',
            confidence: 0.95,
            action: 'ANSWER'
        });
    }),

    // Success: Suggestions endpoint
    http.post('/api/suggest', async ({ request }) => {
        const body = await request.json();

        await new Promise(resolve => setTimeout(resolve, 50));

        return HttpResponse.json({
            questions: [
                'What is the VPN password?',
                'How do I reset my email?',
                'Where is the office located?'
            ]
        });
    }),

    // Error: Network timeout simulation
    http.post('/api/chat-timeout', () => {
        return HttpResponse.error();
    }),

    // Error: 500 Internal Server Error
    http.post('/api/chat-error', () => {
        return HttpResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }),

    // Error: 429 Rate Limit
    http.post('/api/chat-ratelimit', () => {
        return HttpResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        );
    }),
];
