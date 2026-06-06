import type { Message } from '../types';

interface Props {
  message: Message;
}

export default function QuestionCard({ message }: Props) {
  const qNum = message.metadata?.questionNumber;
  const total = message.metadata?.roundTotal;

  return (
    <div className="flex gap-3 mb-5">
      <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-[10px] font-bold">AI</span>
      </div>
      <div className="flex-1 max-w-[75%]">
        <div className="bg-card-bg border border-border rounded-xl px-4 py-3">
          {qNum && (
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wide">
              {total ? `第 ${qNum}/${total} 题` : `Q${qNum}`}
            </span>
          )}
          <div className="text-[15px] text-text-primary mt-1 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}
