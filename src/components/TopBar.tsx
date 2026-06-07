import { useStore } from '../store';

export default function TopBar() {
  const toggleNotes = useStore((s) => s.toggleNotes);
  const currentBook = useStore((s) => s.currentBook);

  return (
    <header className="sticky top-0 z-10 bg-page h-12 flex items-center gap-3 px-3">
      <button
        onClick={toggleNotes}
        title="侧栏"
        className="w-7 h-7 rounded-[9px] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-active-bg transition-colors flex-shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h11" />
        </svg>
      </button>
      <span className="text-sm font-medium text-text-primary truncate">
        {currentBook ? currentBook.title : '学习导师'}
      </span>
    </header>
  );
}
