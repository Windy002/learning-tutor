import { useStore } from '../store';

export default function TopBar() {
  const toggleNotes = useStore((s) => s.toggleNotes);
  const toggleSettings = useStore((s) => s.toggleSettings);

  return (
    <header className="sticky top-0 z-10 bg-page border-b border-border h-12 flex items-center justify-between px-3">
      <button
        onClick={toggleNotes}
        title="侧栏"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bubble transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <rect x="2" y="3" width="5" height="12" rx="1" />
          <rect x="11" y="7" width="5" height="8" rx="1" />
        </svg>
      </button>

      <span className="text-sm font-medium text-text-primary absolute left-1/2 -translate-x-1/2">学习导师</span>

      <button
        onClick={toggleSettings}
        title="设置"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bubble transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 1.5v1.5M8 13v1.5M3.4 3.4l1 1M11.6 11.6l1 1M1.5 8H3M13 8h1.5M3.4 12.6l1-1M11.6 4.4l1-1" />
        </svg>
      </button>
    </header>
  );
}
