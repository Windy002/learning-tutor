export type Phase = '摸底测试' | '精准补漏' | '循环迭代' | '全景收网';

export type MessageType = 'question' | 'answer' | 'feedback' | 'summary';

export type Verdict = 'correct' | 'partial' | 'wrong';

export interface Message {
  id: string;
  type: MessageType;
  role: 'user' | 'assistant';
  phase: Phase;
  round: number;
  content: string;
  metadata?: {
    verdict?: Verdict;
    questionNumber?: number;
    roundTotal?: number;
  };
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  domain: string;
  goal: string;
  createdAt: string;
  notes: Note[];
}

export interface Session {
  id: string;
  bookId: string;
  phase: Phase;
  round: number;
  messages: Message[];
  createdAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  sessionId: string;
  content: string;
  createdAt: string;
}
