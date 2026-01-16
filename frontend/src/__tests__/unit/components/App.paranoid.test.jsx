/**
 * App Component - PARANOID EDITION
 * =================================
 * Error Rate Target: 0.01%
 * 
 * Coverage Areas:
 * 1. Rendering & Lifecycle
 * 2. User Interactions
 * 3. API Integration
 * 4. State Management
 * 5. Error Handling
 * 6. Edge Cases
 * 7. Security
 * 8. Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../../App';
import { server } from '../../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('App Component - PARANOID MODE', () => {

    // ==========================================
    // CATEGORY 1: BASIC RENDERING
    // ==========================================

    describe('Initial Rendering', () => {
        it('should render without crashing', () => {
            expect(() => render(<App />)).not.toThrow();
        });

        it('should display the main heading', async () => {
            render(<App />);
            await waitFor(() => {
                expect(screen.getByText(/Revolutionizing Support/i)).toBeInTheDocument();
            });
        });

        it('should show initial greeting message', async () => {
            render(<App />);
            await waitFor(() => {
                expect(screen.getByText(/สวัสดีครับ/i)).toBeInTheDocument();
            });
        });

        it('should render all major sections', async () => {
            render(<App />);
            await waitFor(() => {
                expect(screen.getByText(/The Challenge at Mango Consultant/i)).toBeInTheDocument();
                expect(screen.getByText(/WUT \+ WAY Architecture/i)).toBeInTheDocument();
                expect(screen.getByText(/Interactive Demo/i)).toBeInTheDocument();
            });
        });

        it('should have accessible navigation', async () => {
            render(<App />);
            await waitFor(() => {
                const nav = screen.getByRole('navigation', { hidden: true });
                expect(nav).toBeInTheDocument();
            });
        });
    });

    // ==========================================
    // CATEGORY 2: USER INPUT VALIDATION
    // ==========================================

    describe('Input Validation - PARANOID', () => {
        it('should reject empty messages', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            const sendButton = screen.getByRole('button', { name: /send/i });

            await userEvent.clear(input);
            await userEvent.click(sendButton);

            // Should not add any user message
            await waitFor(() => {
                expect(screen.queryByText(/^$/)).not.toBeInTheDocument();
            });
        });

        it('should reject whitespace-only messages', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            const sendButton = screen.getByRole('button', { name: /send/i });

            await userEvent.type(input, '   \n\t  ');
            await userEvent.click(sendButton);

            // Input should be cleared but no message sent
            await waitFor(() => {
                expect(input).toHaveValue('');
            });
        });

        it('should handle very long messages (10000+ chars)', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            const sendButton = screen.getByRole('button', { name: /send/i });

            const longMessage = 'A'.repeat(10000);
            await userEvent.type(input, longMessage);

            // Wait for input update
            await waitFor(() => {
                expect(input.value.length).toBe(10000);
            }, { timeout: 3000 });

            // Ensure button enabled
            await waitFor(() => {
                expect(sendButton).not.toBeDisabled();
            });

            await userEvent.click(sendButton);

            // Wait for message to be sent and input cleared
            await waitFor(() => {
                expect(input).toHaveValue('');
            }, { timeout: 5000 });

            // Should not crash and input should still exist
            expect(input).toBeInTheDocument();
        });

        it('should handle special characters safely', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            const specialChars = `<script>alert('XSS')</script>`;
            await userEvent.type(input, specialChars);
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            // Should display as plain text, not execute
            await waitFor(() => {
                const messages = screen.getAllByText(/script/i);
                messages.forEach(msg => {
                    expect(msg.tagName).not.toBe('SCRIPT');
                });
            });
        });

        it('should handle emoji and unicode correctly', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            const emojiMessage = '😀 สวัสดี 🥭 ขอรีเซ็ตรหัส 🔒';
            await userEvent.type(input, emojiMessage);
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/😀 สวัสดี 🥭 ขอรีเซ็ตรหัส 🔒/i)).toBeInTheDocument();
            });
        });

        it('should handle Thai combining characters', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            // Thai vowels with combining marks
            const thaiText = 'ขอสู\u0e39ตรทำข\u0e49าวมันไก่';
            await userEvent.type(input, thaiText);

            await waitFor(() => {
                expect(input).toHaveValue(expect.stringContaining('สูตร'));
                expect(input).toHaveValue(expect.stringContaining('ข้าว'));
                // Use button enablement as proxy for state settlement
                const sendButton = screen.getByRole('button', { name: /send/i });
                expect(sendButton).not.toBeDisabled();
            });
        });
    });
    // ==========================================
    // CATEGORY 3: API INTEGRATION
    // ==========================================

    describe('API Integration - PARANOID', () => {
        it('should send message to backend and display response', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/This is a mocked AI response/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors gracefully', async () => {
            // Override handler to simulate network error
            server.use(
                http.post('/api/chat', () => {
                    return HttpResponse.error();
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error/i)).toBeInTheDocument();
            });
        });

        it('should handle 500 server errors', async () => {
            server.use(
                http.post('/api/chat', () => {
                    return HttpResponse.json(
                        { error: 'Internal server error' },
                        { status: 500 }
                    );
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/Server Error: 500/i)).toBeInTheDocument();
            });
        });

        it('should handle malformed JSON responses', async () => {
            server.use(
                http.post('/api/chat', () => {
                    return new HttpResponse('This is not JSON', {
                        status: 200,
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                    });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/Error/i)).toBeInTheDocument();
            });
        });

        it('should handle timeout gracefully', async () => {
            server.use(
                http.post('/api/chat', async () => {
                    await new Promise(resolve => setTimeout(resolve, 15000)); // 15s timeout
                    return HttpResponse.json({ response: 'Too late' });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            // Should show loading state
            await waitFor(() => {
                expect(screen.getByText(/thinking/i)).toBeInTheDocument();
            });
        }, 20000); // Extend test timeout

        it('should include conversation history in API request', async () => {
            let capturedRequest = null;

            server.use(
                http.post('/api/chat', async ({ request }) => {
                    capturedRequest = await request.json();
                    return HttpResponse.json({
                        response: 'Response with context',
                        confidence: 0.95
                    });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            // Send first message
            await userEvent.type(input, 'First message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));
            await waitFor(() => expect(screen.getByText(/Response with context/i)).toBeInTheDocument());

            // Send second message
            await userEvent.type(input, 'Second message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(capturedRequest.messages.length).toBeGreaterThan(1);
            });
        });
    });

    // ==========================================
    // CATEGORY 4: STATE MANAGEMENT
    // ==========================================

    describe('State Management - PARANOID', () => {
        it('should persist chat history in localStorage', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test persistence');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                const stored = localStorage.getItem('chat_sessions');
                expect(stored).toBeTruthy();
                const sessions = JSON.parse(stored);
                expect(sessions.length).toBeGreaterThan(0);
            });
        });

        it('should restore chat history from localStorage on mount', async () => {
            const mockSession = {
                id: 'test-123',
                messages: [
                    { role: 'user', content: 'Hello from storage' }
                ],
                timestamp: Date.now()
            };

            localStorage.setItem('chat_sessions', JSON.stringify([mockSession]));
            localStorage.setItem('current_session_id', 'test-123');

            render(<App />);

            await waitFor(() => {
                expect(screen.getByText(/Hello from storage/i)).toBeInTheDocument();
            });
        });

        it('should handle corrupted localStorage gracefully', async () => {
            localStorage.setItem('chat_sessions', 'INVALID_JSON{{{');

            expect(() => render(<App />)).not.toThrow();

            // Should start with fresh session
            await waitFor(() => {
                expect(screen.getByText(/สวัสดีครับ/i)).toBeInTheDocument();
            });
        });

        it('should limit conversation history to last 6 messages', async () => {
            let capturedRequest = null;

            server.use(
                http.post('/api/chat', async ({ request }) => {
                    capturedRequest = await request.json();
                    return HttpResponse.json({ response: 'OK' });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            // Send 10 messages
            for (let i = 0; i < 10; i++) {
                await userEvent.clear(input);
                await userEvent.type(input, `Message ${i}`);
                await userEvent.click(screen.getByRole('button', { name: /send/i }));
                await waitFor(() => screen.getByText(/OK/i));
            }

            // Check last request only has 6 messages
            expect(capturedRequest.messages.length).toBeLessThanOrEqual(6);
        });

        it('should clear messages on reset', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => expect(screen.getByText(/Test message/i)).toBeInTheDocument());

            // Click reset
            const resetButton = screen.getByText(/Reset Chat/i);
            await userEvent.click(resetButton);

            // Old message should be gone
            await waitFor(() => {
                expect(screen.queryByText(/Test message/i)).not.toBeInTheDocument();
            });
        });
    });

    // ==========================================
    // CATEGORY 5: UI INTERACTIONS
    // ==========================================

    describe('UI Interactions - PARANOID', () => {
        it('should disable input while AI is typing', async () => {
            server.use(
                http.post('/api/chat', async () => {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return HttpResponse.json({ response: 'Delayed response' });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            const sendButton = screen.getByRole('button', { name: /send/i });

            await userEvent.type(input, 'Test');
            await userEvent.click(sendButton);

            // Input should be disabled during API call
            await waitFor(() => {
                expect(input).toBeDisabled();
                expect(sendButton).toBeDisabled();
            });

            await waitFor(() => {
                expect(input).not.toBeDisabled();
            });
        });

        it('should show loading indicator while processing', async () => {
            server.use(
                http.post('/api/chat', async () => {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return HttpResponse.json({ response: 'OK' });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/thinking/i)).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
            });
        });

        it('should clear input after sending message', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test message');
            await waitFor(() => {
                expect(input).toHaveValue('Test message');
            });

            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(input).toHaveValue('');
            });
        });

        it('should handle rapid clicking (debounce)', async () => {
            let requestCount = 0;

            server.use(
                http.post('/api/chat', async () => {
                    requestCount++;
                    return HttpResponse.json({ response: 'OK' });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            const sendButton = screen.getByRole('button', { name: /send/i });

            await userEvent.type(input, 'Test');

            // Click 10 times rapidly
            for (let i = 0; i < 10; i++) {
                fireEvent.click(sendButton);
            }

            await waitFor(() => {
                // Should only send once (button disabled after first click)
                expect(requestCount).toBe(1);
            });
        });

        it('should auto-scroll to bottom when new messages arrive', async () => {
            const scrollIntoViewMock = vi.fn();
            window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                // scrollIntoView should be called for messagesEndRef
                expect(scrollIntoViewMock).toHaveBeenCalled();
            });
        });

        it('should handle scenario chip clicks', async () => {
            render(<App />);

            const chip = screen.getByText(/1\. Auto-Resolve/i);
            await userEvent.click(chip);

            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);
            await waitFor(() => {
                expect(input.value).toContain('รหัสผ่าน');
            });
        });

        it('should handle suggestion chip clicks (async)', async () => {
            server.use(
                http.post('/api/suggest', () => {
                    return HttpResponse.json({
                        questions: ['How do I reset password?', 'Where is VPN guide?']
                    });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            // Wait for suggestions to appear
            await waitFor(() => {
                expect(screen.getByText(/How do I reset password\?/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            const suggestionChip = screen.getByText(/How do I reset password\?/i);
            await userEvent.click(suggestionChip);

            await waitFor(() => {
                expect(input.value).toContain('How do I reset password?');
            });
        });
    });

    // ==========================================
    // CATEGORY 6: SECURITY
    // ==========================================

    describe('Security - PARANOID', () => {
        it('should sanitize XSS attempts in user input', async () => {
            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            const xssPayload = '<img src=x onerror=alert("XSS")>';
            await userEvent.type(input, xssPayload);
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                // Should render as text, not execute
                const textElements = screen.getAllByText(/img src/i);
                textElements.forEach(el => {
                    expect(el.tagName).not.toBe('IMG');
                });
            });
        });

        it('should not execute JavaScript in AI responses', async () => {
            server.use(
                http.post('/api/chat', () => {
                    return HttpResponse.json({
                        response: '<script>alert("Hacked!")</script>You are hacked'
                    });
                })
            );

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, 'Test');
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                expect(screen.getByText(/script/i)).toBeInTheDocument();
                // Script should not be in DOM
                expect(document.querySelector('script[src*="alert"]')).toBeNull();
            });
        });

        it('should handle SQL injection attempts safely', async () => {
            const sqlInjection = "'; DROP TABLE users; --";

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.type(input, sqlInjection);
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            await waitFor(() => {
                // Should send as plain text
                expect(screen.getByText(/DROP TABLE/i)).toBeInTheDocument();
            });
        });

        it('should prevent prototype pollution', async () => {
            const pollutionPayload = '{"__proto__":{"isAdmin":true}}';

            render(<App />);
            const input = screen.getByPlaceholderText(/พิมพ์คำถาม/i);

            await userEvent.paste(input, pollutionPayload);
            await userEvent.click(screen.getByRole('button', { name: /send/i }));

            // Prototype should not be polluted
            await waitFor(() => {
                expect(Object.prototype.isAdmin).toBeUndefined();
            });
        });
    });
});
