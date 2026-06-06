import { useStore } from '../store';
import type { Book, Session, Message, Note } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useApi() {
  const store = useStore();

  const fetchBooks = async () => {
    store.setLoading(true);
    try {
      const books = await request<Book[]>('/books');
      store.setBooks(books);
    } catch (e: any) {
      store.setError(e.message);
    } finally {
      store.setLoading(false);
    }
  };

  const createBook = async (book: Book) => {
    store.setLoading(true);
    try {
      const created = await request<Book>('/books', {
        method: 'POST',
        body: JSON.stringify(book),
      });
      store.setBooks([...store.books, created]);
      store.setCurrentBook(created);
      return created;
    } catch (e: any) {
      store.setError(e.message);
      throw e;
    } finally {
      store.setLoading(false);
    }
  };

  const fetchSessions = async (bookId: string) => {
    store.setLoading(true);
    try {
      const sessions = await request<Session[]>(`/sessions?bookId=${bookId}`);
      store.setSessions(sessions);
    } catch (e: any) {
      store.setError(e.message);
    } finally {
      store.setLoading(false);
    }
  };

  const saveSession = async (session: Session) => {
    store.setLoading(true);
    try {
      const saved = await request<Session>('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          ...session,
          messages: store.messages,
          phase: store.currentPhase,
          round: store.currentRound,
        }),
      });
      return saved;
    } catch (e: any) {
      store.setError(e.message);
      throw e;
    } finally {
      store.setLoading(false);
    }
  };

  const addNote = async (bookId: string, content: string, sessionId: string) => {
    const note = await request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify({ bookId, content, sessionId }),
    });
    return note;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: store.currentPhase === '全景收网' ? 'summary' : 'answer',
      role: 'user',
      phase: store.currentPhase,
      round: store.currentRound,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    store.addMessage(message);
    return message;
  };

  const askAI = async (userInput?: string) => {
    const book = store.currentBook;
    if (!book) {
      store.setError('请先选择或创建一本书');
      return;
    }

    // If user typed something, add it first
    if (userInput?.trim()) {
      store.addMessage({
        id: `msg_${Date.now()}`,
        type: 'answer',
        role: 'user',
        phase: store.currentPhase,
        round: store.currentRound,
        content: userInput.trim(),
        timestamp: new Date().toISOString(),
      });
    }

    store.setLoading(true);

    // Create placeholder for AI response
    const aiMsgId = `msg_${Date.now()}_ai`;
    const aiMsgType = store.currentPhase === '全景收网' ? 'summary'
      : store.currentPhase === '摸底测试' ? 'question'
      : 'feedback';
    const aiMsg: Message = {
      id: aiMsgId,
      type: aiMsgType,
      role: 'assistant',
      phase: store.currentPhase,
      round: store.currentRound,
      content: '',
      timestamp: new Date().toISOString(),
    };
    store.addMessage(aiMsg);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: store.messages.filter(m => m.id !== aiMsgId).map(m => ({
            role: m.role,
            content: m.content,
          })),
          systemPrompt: store.currentTemplate.buildSystemPrompt(
            book.title, book.domain, book.goal, store.currentPhase
          ),
          apiKey: store.apiKey,
          apiBase: store.apiBase,
          model: store.model,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                const msgs = useStore.getState().messages;
                const updatedMsgs = msgs.map(m =>
                  m.id === aiMsgId ? { ...m, content: m.content + parsed.content } : m
                );
                useStore.setState({ messages: updatedMsgs });
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e: any) {
              if (e.message && !e.message.includes('JSON')) throw e;
            }
          }
        }
      }
    } catch (e: any) {
      store.setError(e.message);
      // Remove the empty AI message on error
      useStore.setState({
        messages: useStore.getState().messages.filter(m => m.id !== aiMsgId)
      });
    } finally {
      store.setLoading(false);
    }
  };

  return { fetchBooks, createBook, fetchSessions, saveSession, addNote, sendMessage, askAI };
}
