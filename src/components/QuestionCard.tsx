import type { Message } from '../types';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function QuestionCard({ message }: Props) {
  const qNum = message.metadata?.questionNumber;
  const total = message.metadata?.roundTotal;

  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-[11px] font-bold">AI</span>
      </div>
      <div className="flex-1 min-w-0 max-w-[85%]">
        {qNum && (
          <span className="inline-block text-[12px] text-text-muted font-semibold tracking-wide mb-1.5">
            {total ? `第 ${qNum}/${total} 题` : `Q${qNum}`}
          </span>
        )}
        <MarkdownContent content={message.content} />
      </div>
    </div>
  );
}
