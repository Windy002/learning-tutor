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

  isNotesOpen: false,
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
}));
