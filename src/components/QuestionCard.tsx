import type { Message } from '../types';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function QuestionCard({ message }: Props) {
  const qNum = message.metadata?.questionNumber;
  const total = message.metadata?.roundTotal;

  return (
    <div className="mb-6">
      {qNum && (
        <span className="inline-block text-[12px] text-text-muted font-semibold tracking-wide mb-1.5">
          {total ? `第 ${qNum}/${total} 题` : `Q${qNum}`}
        </span>
      )}
      <MarkdownContent content={message.content} />
    </div>
  );
}
