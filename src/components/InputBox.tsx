import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { useApi } from '../hooks/useApi';

export default function InputBox() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { askAI, cancelAI } = useApi();
  const isLoading = useStore((s) => s.isLoading);
  const currentPhase = useStore((s) => s.currentPhase);
  const messages = useStore((s) => s.messages);
  const prevLoading = useRef(false);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [value]);

  // Auto-focus textarea when AI finishes responding
  useEffect(() => {
    if (prevLoading.current && !isLoading) {
      textareaRef.current?.focus();
    }
    prevLoading.current = isLoading;
  }, [isLoading]);

  const handleSend = async () => {
    if (isLoading) return;
    // If input has text, send it to AI
    if (value.trim()) {
      const input = value.trim();
      setValue('');
      await askAI(input);
      return;
    }
    // If empty, retry last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setValue('');
      await askAI(lastUserMsg.content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isLoading) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastAiFailed = messages.length > 0 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.content?.startsWith('❌');

  const phaseLabel = lastAiFailed
    ? '重试'
    : currentPhase === '摸底测试' ? '让 AI 出题'
    : currentPhase === '精准补漏' || currentPhase === '循环迭代' ? '提交并获取反馈'
    : '生成总结';

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
          {isLoading ? (
            <button
              onClick={cancelAI}
              title="停止生成"
              className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center
                hover:bg-red-600 transition-colors animate-[pulse_2s_ease-in-out_infinite]"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                <rect x="1" y="1" width="10" height="10" rx="1.5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              title={phaseLabel}
              className="flex-shrink-0 w-8 h-8 bg-brand rounded-lg flex items-center justify-center
                hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8l12-6-6 12-2-6-4-3z" fill="white" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-center text-[11px] text-text-muted mt-2">
          AI 导师可能会出错，请核实重要信息。
        </p>
      </div>
    </div>
  );
}
