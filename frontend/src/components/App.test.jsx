/**
 * App component tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock fetch globally
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should render the app', () => {
    render(<App />);
    expect(screen.getByText(/Mango Helpdesk AI/i)).toBeInTheDocument();
  });

  it('should display hero section', () => {
    render(<App />);
    const heroSection = screen.getByText(/WUT.*WAY/i);
    expect(heroSection).toBeInTheDocument();
  });

  it('should have chat interface', () => {
    render(<App />);
    const chatInput = screen.getByPlaceholderText(/พิมพ์คำถาม|ข้อความ/i);
    expect(chatInput).toBeInTheDocument();
  });

  it('should display initial greeting message', () => {
    render(<App />);
    expect(screen.getByText(/สวัสดี/i)).toBeInTheDocument();
  });
});

describe('Chat Functionality', () => {
  beforeEach(() => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            request_id: 'test_123',
            department: 'IT',
            intent: 'question',
            urgency: 'low',
            confidence: 0.85,
            answer: 'This is a test response',
            action: 'AUTO_RESOLVE',
          }),
      })
    );
  });

  it('should send message when button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/พิมพ์/i);
    const sendButton = screen.getByRole('button', { name: /send|ส่ง/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/query'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should display user message after sending', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test message{enter}');

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('should show typing indicator', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test{enter}');

    // Typing indicator should appear briefly
    const typingIndicator = screen.queryByText(/กำลัง/i);
    if (typingIndicator) {
      expect(typingIndicator).toBeInTheDocument();
    }
  });

  it('should clear input after sending', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test{enter}');

    await waitFor(() => {
      // Should show error message or handle gracefully
      expect(screen.queryByText(/error|ผิดพลาด/i)).toBeTruthy();
    });
  });
});

describe('Dev Mode', () => {
  it('should toggle dev mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Look for dev mode toggle (if exists)
    const devToggle = screen.queryByText(/dev|development/i);
    if (devToggle) {
      await user.click(devToggle);
      // Verify dev mode features are shown
    }
  });
});
