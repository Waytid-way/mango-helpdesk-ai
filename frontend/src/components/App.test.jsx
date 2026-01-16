/**
 * App component tests - Refactored for MSW Compatibility
 * Uses MSW for API mocking - DO NOT override global.fetch
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

// ❌ REMOVED: global.fetch override
// vi.stubGlobal('fetch', vi.fn()); 

describe('App Component', () => {
  it('should render the app', async () => {
    render(<App />);
    expect(await screen.findByText(/System Online/i)).toBeInTheDocument();
  });

  it('should display hero section', async () => {
    render(<App />);
    expect(await screen.findByText(/WUT Orchestrator/i)).toBeInTheDocument();
    expect(await screen.findByText(/WAY RAG Engine/i)).toBeInTheDocument();
  });

  it('should have chat interface', async () => {
    render(<App />);
    const chatInput = await screen.findByPlaceholderText(/พิมพ์คำถาม|ข้อความ/i);
    expect(chatInput).toBeInTheDocument();
  });

  it('should display initial greeting message', async () => {
    render(<App />);
    expect(await screen.findByText(/สวัสดี/i)).toBeInTheDocument();
  });
});

describe('Chat Functionality', () => {
  it('should send message when button clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByPlaceholderText(/พิมพ์/i);
    const sendButton = screen.getByRole('button', { name: /send|ส่ง/i });

    await user.type(input, 'Test message');
    await user.click(sendButton);

    // Wait for AI response from MSW handler
    await waitFor(() => {
      expect(screen.getByText(/mocked AI response/i)).toBeInTheDocument();
    });
  });

  it('should display user message after sending', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('should show typing indicator', async () => {
    // Add delay to MSW handler
    server.use(
      http.post('/api/chat', async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return HttpResponse.json({ response: 'Delayed' });
      })
    );

    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test');
    await user.keyboard('{Enter}');

    // Typing indicator should appear
    await waitFor(() => {
      expect(screen.getByText(/thinking/i)).toBeInTheDocument();
    });
  });

  it('should clear input after sending', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    server.use(
      http.post('/api/chat', () => {
        return HttpResponse.error();
      })
    );

    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByPlaceholderText(/พิมพ์/i);
    await user.type(input, 'Test');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});

describe('Dev Mode', () => {
  it('should toggle dev mode', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for initial render of dev mode toggle
    const devToggle = await screen.findByText(/Dev Mode:/i);
    await user.click(devToggle);

    await waitFor(() => {
      expect(screen.getByText(/Dev Mode: ON/i)).toBeInTheDocument();
    });
  });
});
