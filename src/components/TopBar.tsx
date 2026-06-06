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
    <header className="sticky top-0 z-10 bg-page border-b border-border px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 bg-brand rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">学</span>
        </div>
        <span className="text-[15px] font-medium text-text-primary">学习导师</span>
        {currentBook && (
          <>
            <span className="text-text-muted text-sm">·</span>
            <span className="text-sm text-text-secondary">{currentBook.title}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
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

        <button
          onClick={toggleNotes}
          title="笔记面板 (Ctrl+B)"
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isNotesOpen
              ? 'bg-brand text-white'
              : 'bg-white border border-border text-text-muted hover:text-text-primary hover:border-text-muted'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2h7a2 2 0 012 2v8a2 2 0 01-2 2H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
            <path d="M12 5h1a1 1 0 011 1v7a1 1 0 01-1 1H5" />
            <line x1="5" y1="5" x2="9" y2="5" />
            <line x1="5" y1="8" x2="9" y2="8" />
            <line x1="5" y1="11" x2="7" y2="11" />
          </svg>
        </button>
      </div>
    </header>
  );
}
