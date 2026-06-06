import type { Message } from '../types';
import VerdictBadge from './VerdictBadge';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function FeedbackBlock({ message }: Props) {
  const verdict = message.metadata?.verdict;

  return (
    <div className="flex gap-3 mb-5">
      <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-[10px] font-bold">AI</span>
      </div>
      <div className="flex-1 max-w-[75%]">
        {verdict && (
          <div className="mb-1.5">
            <VerdictBadge verdict={verdict} />
          </div>
        )}
        <div className="text-[15px] text-text-primary leading-relaxed">
          <MarkdownContent content={message.content} />
        </div>
      </div>
    </div>
  );
}
