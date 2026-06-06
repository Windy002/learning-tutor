import { useStore } from '../store';
import { useApi } from '../hooks/useApi';
import { useState, useEffect } from 'react';
import type { Book, Session } from '../types';
import { templates } from '../templates';

export default function SessionSidebar() {
  const isOpen = useStore((s) => s.isNotesOpen);
  const toggleSidebar = useStore((s) => s.toggleNotes);
  const books = useStore((s) => s.books);
  const currentBook = useStore((s) => s.currentBook);
  const setCurrentBook = useStore((s) => s.setCurrentBook);
  const sessions = useStore((s) => s.sessions);
  const currentSession = useStore((s) => s.currentSession);
  const setCurrentSession = useStore((s) => s.setCurrentSession);
  const messages = useStore((s) => s.messages);
  const currentPhase = useStore((s) => s.currentPhase);
  const currentRound = useStore((s) => s.currentRound);
  const setCurrentPhase = useStore((s) => s.setCurrentPhase);
  const setCurrentRound = useStore((s) => s.setCurrentRound);
  const templateId = useStore((s) => s.templateId);
  const currentTemplate = useStore((s) => s.currentTemplate);
  const setTemplate = useStore((s) => s.setTemplate);
  const { fetchBooks, createBook, fetchSessions, saveSession, askAI, addNote, deleteNote } = useApi();
  const showToast = useStore((s) => s.showToast);
  const setBooks = useStore((s) => s.setBooks);
  const setSessions = useStore((s) => s.setSessions);
  const setMessages = useStore((s) => s.setMessages);
  const [activeTab, setActiveTab] = useState<'sessions' | 'notes'>('sessions');
  const [showNewBook, setShowNewBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDomain, setNewBookDomain] = useState('');
  const [newBookGoal, setNewBookGoal] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const notes = currentBook?.notes || [];

  const handleNewSession = () => {
    if (!currentBook) {
      setShowNewBook(true);
      return;
    }
    const id = `sess_${Date.now()}`;
    const session: Session = {
      id,
      bookId: currentBook.id,
      phase: '摸底测试',
      round: 1,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setCurrentSession(session);
    saveSession(session);
    // Trigger AI to ask the first question
    askAI();
  };

  const handleSelectSession = async (session: Session) => {
    // Save current session first
    if (currentSession && messages.length > 0) {
      await saveSession(currentSession);
    }
    setCurrentSession(session);
    setCurrentPhase(session.phase);
    setCurrentRound(session.round);
  };

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return;
    const book: Book = {
      id: `book_${Date.now()}`,
      title: newBookTitle.trim(),
      domain: newBookDomain.trim(),
      goal: newBookGoal.trim(),
      createdAt: new Date().toISOString(),
      notes: [],
    };
    await createBook(book);
    setShowNewBook(false);
    setNewBookTitle('');
    setNewBookDomain('');
    setNewBookGoal('');
    fetchSessions(book.id);
  };

  const handleSelectBook = async (book: Book) => {
    setCurrentBook(book);
    fetchSessions(book.id);
  };

  const handleDeleteSession = async (session: Session) => {
    try {
      await fetch(`/api/sessions/${encodeURIComponent(session.id)}`, { method: 'DELETE' });
      setSessions(sessions.filter(s => s.id !== session.id));
      if (currentSession?.id === session.id) {
        setCurrentSession(null);
        setMessages([]);
      }
      showToast('会话已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`确定删除《${book.title}》及其所有会话？`)) return;
    try {
      await fetch(`/api/books/${encodeURIComponent(book.id)}`, { method: 'DELETE' });
      setBooks(books.filter(b => b.id !== book.id));
      if (currentBook?.id === book.id) {
        setCurrentBook(null);
        setCurrentSession(null);
        setMessages([]);
      }
      showToast('书籍已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim() || !currentBook || !currentSession) return;
    try {
      const note = await addNote(currentBook.id, newNoteText.trim(), currentSession.id);
      if (currentBook) {
        setCurrentBook({
          ...currentBook,
          notes: [...(currentBook.notes || []), note],
        });
      }
      setNewNoteText('');
      showToast('笔记已添加');
    } catch {
      showToast('添加失败', 'error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!currentBook) return;
    try {
      await deleteNote(currentBook.id, noteId);
      setCurrentBook({
        ...currentBook,
        notes: (currentBook.notes || []).filter(n => n.id !== noteId),
      });
      showToast('笔记已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-20 lg:hidden" onClick={toggleSidebar} />
      )}
      <aside
        className={`flex-shrink-0 bg-white border-r border-border
          transform transition-all duration-200 overflow-hidden
          ${isOpen ? 'w-[280px]' : 'w-0'}
        `}
      >
        <div className="w-[280px] h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <div className="flex bg-bubble rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'sessions'
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                会话
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                笔记
              </button>
            </div>
            <button onClick={toggleSidebar} className="text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
          </div>

          {activeTab === 'sessions' ? (
            <>
              {/* Book selector + New session */}
              <div className="p-3 border-b border-border space-y-2">
                <div className="flex gap-1.5">
                  <select
                    value={currentBook?.id || ''}
                    onChange={(e) => {
                      const book = books.find(b => b.id === e.target.value);
                      if (book) handleSelectBook(book);
                    }}
                    className="flex-1 text-xs text-text-primary bg-page border border-border rounded-lg px-2.5 py-1.5 outline-none"
                  >
                    <option value="">选择书籍...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                  {currentBook && (
                    <button
                      onClick={() => handleDeleteBook(currentBook)}
                      title="删除此书"
                      className="text-xs text-text-muted hover:text-red-500 px-1.5 py-1 transition-colors"
                    >
                      🗑
                    </button>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <select
                    value={templateId}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="flex-1 text-xs text-text-primary bg-page border border-border rounded-lg px-2 py-1.5 outline-none"
                    title="学习模式"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleNewSession}
                    className="text-xs text-brand font-medium border border-brand/30 rounded-lg px-3 py-1.5 hover:bg-brand/5 transition-colors whitespace-nowrap"
                  >
                    + 新会话
                  </button>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  {currentTemplate.description}
                </p>
              </div>

              {/* Session list */}
              <div className="flex-1 overflow-y-auto">
                {sessions.length === 0 ? (
                  <p className="text-xs text-text-muted text-center mt-8 px-4">
                    {currentBook ? '点击「+ 新会话」开始' : '先选一本书'}
                  </p>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center border-b border-border/50 hover:bg-page transition-colors group ${
                        currentSession?.id === s.id ? 'bg-page border-l-2 border-l-brand' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSession(s)}
                        className="flex-1 text-left px-3 py-2.5"
                      >
                        <p className="text-xs text-text-primary truncate">
                          {s.messages?.[0]?.content?.slice(0, 30) || `${s.phase} · 第 ${s.round} 轮`}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {new Date(s.createdAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {s.phase} · {s.messages?.length || 0} 条消息
                        </p>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(s); }}
                        title="删除会话"
                        className="text-text-muted hover:text-red-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        🗑
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Notes tab */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border">
                <div className="flex gap-1.5">
                  <input
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                    placeholder="写一条笔记..."
                    className="flex-1 text-xs text-text-primary bg-page border border-border rounded-lg px-2.5 py-1.5 outline-none focus:border-brand"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteText.trim()}
                    className="text-xs text-brand font-medium border border-brand/30 rounded-lg px-2.5 py-1.5 hover:bg-brand/5 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    + 添加
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                {notes.length === 0 ? (
                  <p className="text-xs text-text-muted text-center mt-8">
                    暂无笔记。输入框添加或从总结卡片保存。
                  </p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-page border border-border rounded-lg p-3 mb-2 group relative">
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-2 right-2 text-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
                      >
                        ×
                      </button>
                      <p className="text-xs text-text-primary leading-relaxed whitespace-pre-wrap pr-4">
                        {note.content}
                      </p>
                      <p className="text-[11px] text-text-muted mt-1.5">
                        {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* New book modal */}
      {showNewBook && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-5 w-[320px]">
            <h3 className="text-sm font-semibold text-text-primary mb-3">新建书籍</h3>
            <input
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
              placeholder="书名"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 mb-2 outline-none focus:border-brand"
            />
            <input
              value={newBookDomain}
              onChange={(e) => setNewBookDomain(e.target.value)}
              placeholder="领域（如：财富哲学）"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 mb-2 outline-none focus:border-brand"
            />
            <input
              value={newBookGoal}
              onChange={(e) => setNewBookGoal(e.target.value)}
              placeholder="学习目标（如：理解财富本质）"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 mb-4 outline-none focus:border-brand"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewBook(false)}
                className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5"
              >
                取消
              </button>
              <button
                onClick={handleCreateBook}
                className="text-xs bg-brand text-white rounded-lg px-4 py-1.5 hover:bg-orange-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
