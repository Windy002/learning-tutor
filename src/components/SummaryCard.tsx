import type { Message } from '../types';
import MarkdownContent from './MarkdownContent';
import { useApi } from '../hooks/useApi';
import { useStore } from '../store';

interface Props {
  message: Message;
}

export default function SummaryCard({ message }: Props) {
  const { addNote } = useApi();
  const currentBook = useStore((s) => s.currentBook);
  const currentSession = useStore((s) => s.currentSession);
  const showToast = useStore((s) => s.showToast);
  const updateBookNotes = useStore((s) => s.setCurrentBook);

  const handleSaveToNotes = async () => {
    if (!currentBook || !currentSession) return;
    try {
      const note = await addNote(currentBook.id, message.content, currentSession.id);
      if (currentBook) {
        updateBookNotes({
          ...currentBook,
          notes: [...(currentBook.notes || []), note],
        });
      }
      showToast('已保存到笔记');
    } catch {
      showToast('保存失败', 'error');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-sm font-semibold text-brand">📋 全景总结</span>
        <button
          onClick={handleSaveToNotes}
          className="text-xs text-brand hover:text-orange-700 font-medium underline underline-offset-2"
        >
          保存到笔记
        </button>
      </div>
      <MarkdownContent content={message.content} />
    </div>
  );
}
