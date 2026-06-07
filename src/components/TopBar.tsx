import { useStore } from '../store';

export default function TopBar() {
  const currentBook = useStore((s) => s.currentBook);

  return (
    <header className="sticky top-0 z-10 bg-page h-12 flex items-center justify-center px-3">
      <span className="text-sm font-medium text-text-primary truncate">
        {currentBook ? currentBook.title : '学习导师'}
      </span>
    </header>
  );
}
