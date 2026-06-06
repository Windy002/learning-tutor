import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { useApi } from '../hooks/useApi';

export default function InputBox() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, askAI } = useApi();
  const isLoading = useStore((s) => s.isLoading);
  const currentPhase = useStore((s) => s.currentPhase);

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

  const handleAskAI = async () => {
    const input = value.trim() || undefined;
    setValue('');
    await askAI(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const phaseLabel =
    currentPhase === '摸底测试' ? '让 AI 出题' :
    currentPhase === '精准补漏' || currentPhase === '循环迭代' ? '提交并获取反馈' :
    '生成总结';

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
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center
              hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8l12-6-6 12-2-6-4-3z" fill="white" />
            </svg>
          </button>
        </div>
        <div className="flex justify-center mt-2">
          <button
            onClick={handleAskAI}
            disabled={isLoading}
            className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${
              isLoading
                ? 'bg-bubble text-text-muted cursor-wait'
                : 'bg-white border border-brand/30 text-brand hover:bg-brand/5'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                AI 思考中...
              </span>
            ) : (
              `🤖 ${phaseLabel}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
