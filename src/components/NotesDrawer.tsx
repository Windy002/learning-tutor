import { useStore } from '../store';

export default function NotesDrawer() {
  const isOpen = useStore((s) => s.isNotesOpen);
  const toggleNotes = useStore((s) => s.toggleNotes);
  const currentBook = useStore((s) => s.currentBook);

  const notes = currentBook?.notes || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-20 lg:hidden"
          onClick={toggleNotes}
        />
      )}
      <aside
        className={`fixed right-0 top-0 h-full w-[280px] bg-white border-l border-border z-30
          transform transition-transform duration-200 shadow-lg
          lg:relative lg:shadow-none
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:hidden'}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-text-secondary">📝 学习笔记</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-muted">Ctrl+B</span>
            <button onClick={toggleNotes} className="text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
          </div>
        </div>
        <div className="overflow-y-auto p-3 h-[calc(100%-48px)]">
          {notes.length === 0 ? (
            <p className="text-sm text-text-muted text-center mt-8">
              暂无笔记。全景总结阶段可保存内容到这里。
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-page border border-border rounded-lg p-3 mb-2">
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-[11px] text-text-muted mt-1.5">
                  {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
