import { useStore } from '../store';
import type { Book, Session, Message, Note } from '../types';

const BASE = '/api';

let currentAbortController: AbortController | null = null;

interface ParsedMeta {
  phase?: string;
  round?: number;
  type?: 'question' | 'feedback' | 'summary';
  verdict?: 'correct' | 'partial' | 'wrong';
}

// Catch any [META:...] line — robust against missing braces, quotes, commas
const META_REGEX = /\[META:\s*(.+?)\]\s*$/ms;

function parseMeta(content: string): { cleaned: string; meta: ParsedMeta | null } {
  const match = content.match(META_REGEX);
  if (!match) return { cleaned: content, meta: null };

  // Always strip META line from displayed content
  const cleaned = content.replace(match[0], '').trimEnd();

  const raw = match[1];

  // Try strict JSON first
  try {
    const meta = JSON.parse(raw) as ParsedMeta;
    return { cleaned, meta };
  } catch {}

  // Try wrapping in braces if missing
  if (!raw.startsWith('{')) {
    try {
      const meta = JSON.parse(`{${raw}}`) as ParsedMeta;
      return { cleaned, meta };
    } catch {}
  }

  // Key=value format: phase=摸底测试 round=1 type=question
  const kvMeta: ParsedMeta = {};
  const kvRegex = /(\w+)\s*=\s*"?([^"\s]+)"?/g;
  let kvMatch;
  while ((kvMatch = kvRegex.exec(raw)) !== null) {
    const key = kvMatch[1] as keyof ParsedMeta;
    const val = kvMatch[2];
    if (key === 'round') { const n = parseInt(val); kvMeta.round = isNaN(n) ? undefined : n; }
    else if (key === 'phase') kvMeta.phase = val;
    else if (key === 'type') kvMeta.type = val as ParsedMeta['type'];
    else if (key === 'verdict') kvMeta.verdict = val as ParsedMeta['verdict'];
  }
  if (Object.keys(kvMeta).length > 0) {
    return { cleaned, meta: kvMeta };
  }

  // Last resort: salvage with lenient pattern matching
  const salvage: ParsedMeta = {};
  const p = raw.match(/(?:phase\s*[:=]\s*"?)([^",}\s]+)/i);
  const r = raw.match(/(?:round\s*[:=]\s*)(\d+)/i);
  const t = raw.match(/(?:type\s*[:=]\s*"?)(question|feedback|summary)/i);
  const v = raw.match(/(?:verdict\s*[:=]\s*"?)(correct|partial|wrong)/i);
  if (p) salvage.phase = p[1];
  if (r) salvage.round = parseInt(r[1]);
  if (t) salvage.type = t[1].toLowerCase() as ParsedMeta['type'];
  if (v) salvage.verdict = v[1].toLowerCase() as ParsedMeta['verdict'];
  return { cleaned, meta: Object.keys(salvage).length > 0 ? salvage : null };
}

async function saveCurrentSession() {
  const state = useStore.getState();
  const session = state.currentSession;
  if (!session) return;
  try {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...session,
        messages: state.messages,
        phase: state.currentPhase,
        round: state.currentRound,
      }),
    });
  } catch {
    useStore.getState().setError('会话保存失败，请检查磁盘空间');
  }
}

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

  const deleteNote = async (bookId: string, noteId: string) => {
    await request(`/notes/${encodeURIComponent(bookId)}/${encodeURIComponent(noteId)}`, {
      method: 'DELETE',
    });
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

  const cancelAI = () => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  };

  const askAI = async (userInput?: string) => {
    const book = store.currentBook;
    if (!book) {
      store.showToast('请先选择或创建一本书', 'error');
      return;
    }
    if (!store.apiKey || !store.apiKey.trim()) {
      store.showToast('请先设置 API Key', 'error');
      const state = useStore.getState();
      if (!state.isSettingsOpen) state.toggleSettings();
      return;
    }

    // Cancel any ongoing request
    cancelAI();

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
      currentAbortController = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: currentAbortController.signal,
        body: JSON.stringify({
          messages: (() => {
            const history = store.messages.filter(m => m.id !== aiMsgId).map(m => ({
              role: m.role,
              content: m.content,
              phase: m.phase,
              round: m.round,
            }));
            // DeepSeek API requires at least one message; provide kickoff if empty
            if (history.length === 0) {
              return [{ role: 'user' as const, content: `开始学习《${book.title}》，当前阶段：${store.currentPhase}` }];
            }
            return history;
          })(),
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
      // Parse META after stream completes
      const currentState = useStore.getState();
      const currentMsg = currentState.messages.find(m => m.id === aiMsgId);
      if (currentMsg?.content) {
        const { cleaned, meta } = parseMeta(currentMsg.content);

        if (meta?.type) {
          const updated = currentState.messages.map(m => {
            if (m.id !== aiMsgId) return m;
            const updatedMsg: Message = {
              ...m,
              content: cleaned,
              type: meta.type!,
              metadata: { ...m.metadata },
            };
            if (meta.verdict) {
              updatedMsg.metadata = { ...updatedMsg.metadata, verdict: meta.verdict };
            }
            return updatedMsg;
          });
          useStore.setState({ messages: updated });
        }

        // Auto-apply round
        if (meta?.round && meta.round > 0) {
          useStore.setState({ currentRound: meta.round });
        }

        // Detect phase change → suggest (not auto-apply)
        if (meta?.phase && meta.phase !== currentState.currentPhase) {
          const targetPhase = currentState.currentTemplate.phases.find(
            p => p.name === meta.phase
          );
          if (targetPhase) {
            useStore.setState({
              suggestedPhase: meta.phase,
              suggestedPhaseReason: `${currentState.currentPhase} → ${meta.phase}`,
            });
          }
        }
      }

      // Auto-save session
      await saveCurrentSession();
    } catch (e: any) {
      const msgs = useStore.getState().messages;
      if (e.name === 'AbortError') {
        // Mark partial response as stopped, don't show error
        const updated = msgs.map(m =>
          m.id === aiMsgId && m.content
            ? { ...m, content: m.content + '\n\n*(已停止生成)*' }
            : m.id === aiMsgId && !m.content
              ? null  // remove empty placeholder
              : m
        ).filter(Boolean) as Message[];
        useStore.setState({ messages: updated });
      } else {
        // Keep AI placeholder but show error, so user can retry
        const updated = msgs.map(m =>
          m.id === aiMsgId
            ? { ...m, content: `❌ 请求失败: ${e.message}\n\n请检查 API Key 和网络后重试` }
            : m
        );
        useStore.setState({ messages: updated, error: e.message });
      }
    } finally {
      currentAbortController = null;
      store.setLoading(false);
    }
  };

  return { fetchBooks, createBook, fetchSessions, saveSession, addNote, deleteNote, sendMessage, askAI, cancelAI };
}
