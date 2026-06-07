import { useRef, useEffect } from 'react';
import { useStore } from '../store';
import QuestionCard from './QuestionCard';
import AnswerBubble from './AnswerBubble';
import FeedbackBlock from './FeedbackBlock';
import SummaryCard from './SummaryCard';

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

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto chat-scroll px-5 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-text-muted mt-20">
            <p className="text-lg mb-3">👋 开始你的学习旅程</p>
            <div className="text-sm space-y-1.5 text-text-secondary">
              <p>1. 按 <kbd className="px-1.5 py-0.5 text-xs bg-bubble border border-border rounded">Ctrl+B</kbd> 或左侧按钮打开侧栏</p>
              <p>2. 点击 <strong>+ 新会话</strong> 创建你的第一本书</p>
              <p>3. 配置 API Key（右上角 <strong>⚙️</strong>），AI 会自动出第一道题</p>
            </div>
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
