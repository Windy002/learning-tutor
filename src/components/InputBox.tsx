import { useState, useRef, useEffect } from 'react';
import { useApi } from '../hooks/useApi';

export default function InputBox() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useApi();

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim()) return;
    sendMessage(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-page px-5 py-3">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-border px-4 py-2.5 shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的回答... (Shift+Enter 换行)"
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-[15px] text-text-primary placeholder-text-muted leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center
              hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l12-6-6 12-2-6-4-3z" fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
