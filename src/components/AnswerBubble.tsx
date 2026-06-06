import type { Message } from '../types';

interface Props {
  message: Message;
}

export default function AnswerBubble({ message }: Props) {
  return (
    <div className="flex justify-end mb-5">
      <div className="max-w-[65%] bg-bubble rounded-2xl rounded-br px-4 py-2.5">
        <p className="text-[15px] text-text-primary leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
}
