import type { Message } from '../types';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function QuestionCard({ message }: Props) {
  return (
    <div className="mb-6">
      <MarkdownContent content={message.content} />
    </div>
  );
}
