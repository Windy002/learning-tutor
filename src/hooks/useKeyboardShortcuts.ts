import { useEffect } from 'react';
import { useStore } from '../store';

export function useKeyboardShortcuts() {
  const toggleNotes = useStore((s) => s.toggleNotes);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleNotes();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleNotes]);
}
