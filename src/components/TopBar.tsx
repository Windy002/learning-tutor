import { useStore } from '../store';
import type { Phase } from '../types';

const PHASES: Phase[] = ['摸底测试', '精准补漏', '循环迭代', '全景收网'];

export default function TopBar() {
  const currentBook = useStore((s) => s.currentBook);
  const currentPhase = useStore((s) => s.currentPhase);
  const currentRound = useStore((s) => s.currentRound);
  const setCurrentPhase = useStore((s) => s.setCurrentPhase);
  const isNotesOpen = useStore((s) => s.isNotesOpen);
  const toggleNotes = useStore((s) => s.toggleNotes);

  return (
    <header className="sticky top-0 z-10 bg-page border-b border-border px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleNotes}
          title="笔记面板 (Ctrl+B)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isNotesOpen
              ? 'bg-brand/10 text-brand'
              : 'text-text-muted hover:text-text-primary hover:bg-bubble'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="3" width="5" height="12" rx="1" />
            <rect x="11" y="7" width="5" height="8" rx="1" />
          </svg>
        </button>

        <div className="w-6 h-6 bg-brand rounded flex items-center justify-center flex-shrink-0 ml-0.5">
          <span className="text-white text-[10px] font-bold">学</span>
        </div>
        <span className="text-[15px] font-medium text-text-primary ml-0.5">学习导师</span>
        {currentBook && (
          <>
            <span className="text-text-muted text-sm">·</span>
            <span className="text-sm text-text-secondary">{currentBook.title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-2 py-1">
        <select
          value={currentPhase}
          onChange={(e) => setCurrentPhase(e.target.value as Phase)}
          className="text-xs text-text-secondary bg-transparent border-none outline-none cursor-pointer appearance-none pr-1"
        >
          {PHASES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span className="text-xs text-text-muted">· 第 {currentRound} 轮</span>
      </div>
    </header>
  );
}
