import { useStore } from '../store';

export default function TopBar() {
  const toggleNotes = useStore((s) => s.toggleNotes);
  const toggleSettings = useStore((s) => s.toggleSettings);

  return (
    <header className="sticky top-0 z-10 bg-page h-12 flex items-center justify-between px-3">
      <button
        onClick={toggleNotes}
        title="侧栏"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bubble transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h11" />
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
