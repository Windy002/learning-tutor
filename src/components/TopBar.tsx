import { useStore } from '../store';

export default function TopBar() {
  const toggleNotes = useStore((s) => s.toggleNotes);
  const isOpen = useStore((s) => s.isNotesOpen);
  const currentBook = useStore((s) => s.currentBook);

  return (
    <header className="sticky top-0 z-10 bg-page h-12 flex items-center gap-3 px-3">
      {!isOpen && (
        <button
          onClick={toggleNotes}
          title="展开侧栏"
          className="w-6 h-6 rounded-md flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-active-bg transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2.5 3.5h11M2.5 8h11M2.5 12.5h11" />
          </svg>
        </button>
      )}
      <span className="text-sm font-medium text-text-primary truncate">
        {currentBook ? currentBook.title : '学习导师'}
      </span>
    </header>
  );
}
