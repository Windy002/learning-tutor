import { create } from 'zustand';
import type { Book, Session, Message, Phase } from '../types';
import { getDefaultTemplate, getTemplate, type Template } from '../templates';

interface AppState {
  books: Book[];
  currentBook: Book | null;
  setBooks: (books: Book[]) => void;
  setCurrentBook: (book: Book | null) => void;

  sessions: Session[];
  currentSession: Session | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;

  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;

  currentPhase: Phase;
  setCurrentPhase: (phase: Phase) => void;

  currentRound: number;
  setCurrentRound: (round: number) => void;

  isNotesOpen: boolean;
  toggleNotes: () => void;
  setNotesOpen: (open: boolean) => void;

  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Template
  templateId: string;
  currentTemplate: Template;
  setTemplate: (id: string) => void;
  availablePhases: Phase[];

  // Phase suggestion
  suggestedPhase: string | null;
  suggestedPhaseReason: string;
  setSuggestedPhase: (phase: string | null, reason?: string) => void;
  clearSuggestion: () => void;

  // Toast
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  clearToast: () => void;

  // Settings
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  apiKey: string;
  apiBase: string;
  model: string;
  setApiKey: (key: string) => void;
  setApiBase: (base: string) => void;
  setModel: (model: string) => void;
}

function loadSetting(key: string, fallback: string): string {
  try {
    return localStorage.getItem(`lt_${key}`) || fallback;
  } catch { return fallback; }
}

const defaultTemplate = getDefaultTemplate();
const defaultPhases = defaultTemplate.phases.map(p => p.name) as Phase[];

export const useStore = create<AppState>((set) => ({
  books: [],
  currentBook: null,
  setBooks: (books) => set({ books }),
  setCurrentBook: (book) => set({ currentBook: book }),

  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session, messages: session?.messages || [] }),

  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setMessages: (messages) => set({ messages }),

  currentPhase: defaultPhases[0],
  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  currentRound: 1,
  setCurrentRound: (round) => set({ currentRound: round }),

  isNotesOpen: true,
  toggleNotes: () => set((state) => ({ isNotesOpen: !state.isNotesOpen })),
  setNotesOpen: (open) => set({ isNotesOpen: open }),

  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  templateId: defaultTemplate.id,
  currentTemplate: defaultTemplate,
  setTemplate: (id) => {
    const tpl = getTemplate(id);
    if (!tpl) return;
    const phases = tpl.phases.map(p => p.name) as Phase[];
    set({ templateId: id, currentTemplate: tpl, availablePhases: phases, currentPhase: phases[0] });
  },
  availablePhases: defaultPhases,

  isSettingsOpen: false,
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  suggestedPhase: null,
  suggestedPhaseReason: '',
  setSuggestedPhase: (phase, reason = '') => set({ suggestedPhase: phase, suggestedPhaseReason: reason }),
  clearSuggestion: () => set({ suggestedPhase: null, suggestedPhaseReason: '' }),

  toast: null,
  showToast: (message, type = 'success') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),

  apiKey: loadSetting('apiKey', ''),
  apiBase: loadSetting('apiBase', 'https://api.deepseek.com'),
  model: loadSetting('model', 'deepseek-v4-flash'),
  setApiKey: (key) => { try { localStorage.setItem('lt_apiKey', key); } catch {} set({ apiKey: key }); },
  setApiBase: (base) => { try { localStorage.setItem('lt_apiBase', base); } catch {} set({ apiBase: base }); },
  setModel: (model) => { try { localStorage.setItem('lt_model', model); } catch {} set({ model }); },
}));
