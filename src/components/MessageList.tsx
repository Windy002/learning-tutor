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

  return (
    <div className="flex-1 overflow-y-auto chat-scroll px-5 py-6">
      <div className="max-w-[800px] mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-text-muted mt-20">
            <p className="text-lg mb-2">开始你的学习旅程</p>
            <p className="text-sm">在下方输入框粘贴第一道题目，或选择一本书开始会话。</p>
          </div>
        )}
        {messages.map((msg) => {
          const Comp = ComponentMap[msg.type];
          return Comp ? <Comp key={msg.id} message={msg} /> : null;
        })}
      </div>
    </div>
  );
}
