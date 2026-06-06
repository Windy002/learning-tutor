import { useStore } from '../store';
import type { Phase } from '../types';

export default function TopBar() {
  const currentBook = useStore((s) => s.currentBook);
  const currentPhase = useStore((s) => s.currentPhase);
  const currentRound = useStore((s) => s.currentRound);
  const setCurrentPhase = useStore((s) => s.setCurrentPhase);
  const isNotesOpen = useStore((s) => s.isNotesOpen);
  const toggleNotes = useStore((s) => s.toggleNotes);
  const availablePhases = useStore((s) => s.availablePhases);
  const toggleSettings = useStore((s) => s.toggleSettings);

  return (
    <header className="sticky top-0 z-10 bg-page border-b border-border px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleNotes}
          title="侧栏 (Ctrl+B)"
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

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-border rounded-full px-2 py-1">
          <select
            value={currentPhase}
            onChange={(e) => setCurrentPhase(e.target.value as Phase)}
            className="text-xs text-text-secondary bg-transparent border-none outline-none cursor-pointer appearance-none pr-1"
          >
            {availablePhases.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="text-xs text-text-muted">· 第 {currentRound} 轮</span>
        </div>
        <button
          onClick={toggleSettings}
          title="API 设置"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bubble transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2" />
            <path d="M8 1.33v1.1M8 13.57v1.1M3.27 3.27l.78.78M11.95 11.95l.78.78M1.33 8h1.1M13.57 8h1.1M3.27 12.73l.78-.78M11.95 4.05l.78-.78" />
            <circle cx="8" cy="3" r="0.8" />
            <circle cx="13" cy="8" r="0.8" />
            <circle cx="8" cy="13" r="0.8" />
            <circle cx="3" cy="8" r="0.8" />
          </svg>
        </button>
      </div>
    </header>
  );
}
