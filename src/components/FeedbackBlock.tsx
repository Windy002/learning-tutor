import type { Message } from '../types';
import VerdictBadge from './VerdictBadge';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function FeedbackBlock({ message }: Props) {
  const verdict = message.metadata?.verdict;

  return (
    <div className="mb-6">
      {verdict && (
        <div className="mb-1.5">
          <VerdictBadge verdict={verdict} />
        </div>
      )}
      <MarkdownContent content={message.content} />
    </div>
  );
}
