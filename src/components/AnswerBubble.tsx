import type { Message } from '../types';
import MarkdownContent from './MarkdownContent';

interface Props {
  message: Message;
}

export default function AnswerBubble({ message }: Props) {
  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-[80%] bg-bubble rounded-2xl rounded-br-sm px-5 py-3">
        {message.content.length < 200 ? (
          <p className="text-[16px] text-text-primary leading-7 whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <MarkdownContent content={message.content} />
        )}
      </div>
    </div>
  );
}
