import { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { useApi } from '../hooks/useApi';
import QuestionCard from './QuestionCard';
import AnswerBubble from './AnswerBubble';
import FeedbackBlock from './FeedbackBlock';
import SummaryCard from './SummaryCard';
import type { Book, Session } from '../types';

const ComponentMap: Record<string, React.ComponentType<{ message: any }>> = {
  question: QuestionCard,
  answer: AnswerBubble,
  feedback: FeedbackBlock,
  summary: SummaryCard,
};

export default function MessageList() {
  const messages = useStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLoading = useStore((s) => s.isLoading);
  const currentBook = useStore((s) => s.currentBook);
  const setCurrentSession = useStore((s) => s.setCurrentSession);
  const setTemplate = useStore((s) => s.setTemplate);
  const { askAI, createBook, fetchSessions, saveSession } = useApi();

  // Auto-scroll to bottom when messages change or during streaming
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: isLoading ? 'instant' as any : 'smooth' });
    }
  }, [messages, isLoading]);

  // Scroll to bottom when switching sessions (messages array replaced)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [messages.length === 0]);

  const handleWelcomeAction = async (action: string) => {
    if (action === 'new-session') {
      const book = currentBook;
      if (!book) return;
      const session: Session = {
        id: `sess_${Date.now()}`,
        bookId: book.id,
        phase: '摸底测试',
        round: 1,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setCurrentSession(session);
      saveSession(session);
      askAI();
    } else if (action === 'socratic') {
      setTemplate('socratic');
    } else if (action === 'feynman') {
      setTemplate('feynman');
    }
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto chat-scroll px-5 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-5">
            {/* Logo */}
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand/20">
              <span className="text-white text-2xl font-bold">学</span>
            </div>
            <h1 className="text-2xl font-semibold text-text-primary mb-2">你好，我是学习导师</h1>
            <p className="text-text-muted text-sm max-w-md mb-10 leading-relaxed">
              基于动态自适应教学法 — 从摸底测试到全景收网，
              用降维映射帮你用常识直觉击穿复杂知识。
            </p>

            {/* Quick-start cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {[
                { icon: '📚', title: '开始学习一本书', desc: '创建书籍，AI 主动出题', action: 'new-session', needsBook: true },
                { icon: '💬', title: '苏格拉底式追问', desc: '不给你答案，追问到底', action: 'socratic' },
                { icon: '💡', title: '费曼式解释', desc: '把复杂概念讲到 8 岁孩子能懂', action: 'feynman' },
                { icon: '📝', title: '查看学习笔记', desc: '全景总结已沉淀在侧栏', action: 'notes' },
              ].map((card) => (
                <div
                  key={card.title}
                  onClick={() => handleWelcomeAction(card.action)}
                  className="text-left bg-white border border-border rounded-xl px-4 py-3.5 hover:border-brand/30 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="text-lg mb-1">{card.icon}</div>
                  <p className="text-sm font-medium text-text-primary group-hover:text-brand transition-colors">
                    {card.title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{card.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-text-muted mt-8">
              左侧选择书籍和模板，点击 <strong>+ 新会话</strong> 开始
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const Comp = ComponentMap[msg.type];
          return Comp ? <Comp key={msg.id} message={msg} /> : null;
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
