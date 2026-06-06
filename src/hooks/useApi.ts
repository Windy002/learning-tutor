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

  return { fetchBooks, createBook, fetchSessions, saveSession, addNote, sendMessage };
}
