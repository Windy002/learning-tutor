import type { Message } from '../types';
import VerdictBadge from './VerdictBadge';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function FeedbackBlock({ message }: Props) {
  const verdict = message.metadata?.verdict;

  return (
    <div className="flex gap-4 mb-6">
      <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-[11px] font-bold">AI</span>
      </div>
      <div className="flex-1 min-w-0 max-w-[85%]">
        {verdict && (
          <div className="mb-1.5">
            <VerdictBadge verdict={verdict} />
          </div>
        )}
        <MarkdownContent content={message.content} />
      </div>
    </div>
  );
}
