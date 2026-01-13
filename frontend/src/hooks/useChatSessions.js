import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mango_chat_sessions';

// Generate a unique session ID
const generateId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get title from first user message
const getTitleFromMessages = (messages) => {
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const content = firstUserMsg.content;
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  }
  return 'New Chat';
};

export const useChatSessions = (initialMessage) => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        } else {
          // Create initial session if none exist
          createNewSession();
        }
      } catch (e) {
        console.error('Error parsing sessions:', e);
        createNewSession();
      }
    } else {
      // Create initial session if none exist
      createNewSession();
    }
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create a new chat session
  const createNewSession = useCallback(() => {
    const newSession = {
      id: generateId(),
      title: 'New Chat',
      messages: initialMessage ? [initialMessage] : [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  }, [initialMessage]);

  // Update messages for current session
  const updateCurrentSession = useCallback((newMessages) => {
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: newMessages,
          title: getTitleFromMessages(newMessages),
          updatedAt: Date.now(),
        };
      }
      return session;
    }));
  }, [currentSessionId]);

  // Switch to a different session
  const switchSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
  }, []);

  // Delete a session
  const deleteSession = useCallback((sessionId) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      // If deleted current session, switch to first available or create new
      if (sessionId === currentSessionId && filtered.length > 0) {
        setCurrentSessionId(filtered[0].id);
      } else if (filtered.length === 0) {
        // Create a new session if all are deleted
        const newSession = {
          id: generateId(),
          title: 'New Chat',
          messages: initialMessage ? [initialMessage] : [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      return filtered;
    });
  }, [currentSessionId, initialMessage]);

  // Get current session's messages
  const getCurrentMessages = useCallback(() => {
    const session = sessions.find(s => s.id === currentSessionId);
    return session ? session.messages : (initialMessage ? [initialMessage] : []);
  }, [sessions, currentSessionId, initialMessage]);

  return {
    sessions,
    currentSessionId,
    createNewSession,
    updateCurrentSession,
    switchSession,
    deleteSession,
    getCurrentMessages,
  };
};

export default useChatSessions;
