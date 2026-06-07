import { useStore } from '../store';
import { useApi } from '../hooks/useApi';
import { useState, useEffect, useRef } from 'react';
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
  const suggestedPhase = useStore((s) => s.suggestedPhase);
  const suggestedPhaseReason = useStore((s) => s.suggestedPhaseReason);
  const clearSuggestion = useStore((s) => s.clearSuggestion);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const showNewBook = useStore((s) => s.newBookModalOpen);
  const setShowNewBook = useStore((s) => s.setNewBookModalOpen);
  const [activeTab, setActiveTab] = useState<'sessions' | 'notes'>('sessions');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDomain, setNewBookDomain] = useState('');
  const [newBookGoal, setNewBookGoal] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteBook, setConfirmDeleteBook] = useState<Book | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchBooks();
    }
  }, [fetchBooks]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    // Delay to avoid capturing the current click
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuId]);

  const notes = currentBook?.notes || [];

  const getSessionTitle = (s: Session): string => {
    const firstAI = s.messages?.find(m => m.role === 'assistant');
    if (firstAI?.content) {
      // Clean: strip META tag, take first line or first 40 chars
      const cleaned = firstAI.content.replace(/\[META:.*\]/s, '').trim();
      const firstLine = cleaned.split('\n')[0].replace(/^#+\s*/, '');
      return firstLine.slice(0, 40) + (firstLine.length > 40 ? '…' : '');
    }
    return `${s.phase} · 第 ${s.round} 轮`;
  };

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
      const res = await fetch(`/api/sessions/${encodeURIComponent(session.id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      const updated = sessions.filter(s => s.id !== session.id);
      setSessions(updated);
      if (currentSession?.id === session.id) {
        setCurrentSession(null);
        setMessages([]);
      }
      setOpenMenuId(null);
      showToast('会话已删除');
    } catch {
      showToast('删除失败', 'error');
    }
  };

  const handleDeleteBook = (book: Book) => {
    setConfirmDeleteBook(book);
  };

  const confirmDeleteBookAction = async () => {
    const book = confirmDeleteBook;
    if (!book) return;
    setConfirmDeleteBook(null);
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
        className={`flex-shrink-0 bg-page border-r border-r-[0.8px] border-border/80
          transform transition-all duration-200 overflow-hidden
          ${isOpen ? 'w-72' : 'w-0'}
        `}
      >
        <div className="w-72 h-full flex flex-col">
          {/* Header — Claude.ai style */}
          <div className="px-3 pt-4 pb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 bg-brand rounded-[9px] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7l3 3 5-6" />
                </svg>
              </div>
              <span className="text-[14px] font-semibold text-text-primary">学习导师</span>
            </div>

            {/* Phase suggestion */}
            {suggestedPhase && (
              <div className="mb-3 text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-700">
                <p>🎯 建议切换至「{suggestedPhase}」</p>
                <p className="opacity-70 mt-0.5">{suggestedPhaseReason}</p>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => { setCurrentPhase(suggestedPhase as any); clearSuggestion(); }}
                    className="text-[11px] bg-amber-200/50 hover:bg-amber-200 rounded px-2 py-0.5 font-medium"
                  >
                    确认
                  </button>
                  <button
                    onClick={clearSuggestion}
                    className="text-[11px] hover:bg-amber-100 rounded px-2 py-0.5"
                  >
                    忽略
                  </button>
                </div>
              </div>
            )}

            {/* New session button — Claude.ai style: 12px, 9px radius, 6px 16px */}
            <button
              onClick={handleNewSession}
              className="w-full text-xs font-medium border border-border rounded-[9px] py-1.5 px-4 mb-3 hover:bg-active-bg transition-colors text-text-primary"
            >
              + 新会话
            </button>

            {/* Book + template selectors — subtle */}
            <div className="space-y-1.5 mb-3">
              <select
                value={currentBook?.id || ''}
                onChange={(e) => {
                  const book = books.find(b => b.id === e.target.value);
                  if (book) handleSelectBook(book);
                }}
                className="w-full text-[11px] text-text-muted bg-transparent border-none outline-none cursor-pointer truncate"
              >
                <option value="">📚 选择书籍...</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
              <select
                value={templateId}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full text-[11px] text-text-muted bg-transparent border-none outline-none cursor-pointer truncate"
                title="学习模式"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Tab switcher — more subtle */}
            <div className="flex gap-3 text-xs border-b border-border pb-2">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`pb-1.5 border-b-2 transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-brand text-text-primary font-medium'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                会话
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-1.5 border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'border-brand text-text-primary font-medium'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                笔记
              </button>
            </div>
          </div>

          {activeTab === 'sessions' ? (
            <>
              <div className="flex-1 overflow-y-auto px-2">
                {sessions.length === 0 ? (
                  <p className="text-xs text-text-muted text-center mt-8 px-4">
                    {currentBook ? '点击「+ 新会话」开始' : '先选一本书'}
                  </p>
                ) : (
                  sessions.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center px-2 transition-colors relative ${
                        currentSession?.id === s.id ? 'bg-active-bg rounded-[9px]' : 'hover:bg-active-bg/50 rounded-[9px]'
                      }`}
                      onClick={() => handleSelectSession(s)}
                    >
                      <button className="flex-1 text-left px-2 py-1.5 min-w-0">
                        <p className={`text-xs truncate leading-snug ${
                          currentSession?.id === s.id ? 'text-active-text font-medium' : 'text-text-primary'
                        }`}>
                          {getSessionTitle(s)}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === s.id ? null : s.id);
                        }}
                        className="text-text-muted hover:text-text-primary hover:bg-bubble rounded p-1 mr-1 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                          <circle cx="7" cy="2" r="1.3" />
                          <circle cx="7" cy="7" r="1.3" />
                          <circle cx="7" cy="12" r="1.3" />
                        </svg>
                      </button>
                      {openMenuId === s.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-8 top-1/2 -translate-y-1/2 z-30 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[100px]"
                        >
                          <button
                            onClick={() => handleDeleteSession(s)}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            删除会话
                          </button>
                        </div>
                      )}
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
          {/* Footer */}
          <div className="mt-auto border-t border-border px-3 py-2.5 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">{currentPhase}</span>
            <button
              onClick={toggleSettings}
              title="设置"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="2.5" />
                <path d="M8 1.5v1.5M8 13v1.5M3.4 3.4l1 1M11.6 11.6l1 1M1.5 8H3M13 8h1.5M3.4 12.6l1-1M11.6 4.4l1-1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Confirm delete book modal */}
      {confirmDeleteBook && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setConfirmDeleteBook(null)}>
          <div className="bg-white rounded-xl shadow-xl p-5 w-[320px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text-primary mb-2">确认删除</h3>
            <p className="text-xs text-text-secondary mb-4">
              确定删除《{confirmDeleteBook.title}》及其所有会话？此操作不可撤销。
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeleteBook(null)} className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5">取消</button>
              <button onClick={confirmDeleteBookAction} className="text-xs bg-red-500 text-white rounded-lg px-4 py-1.5 hover:bg-red-600">删除</button>
            </div>
          </div>
        </div>
      )}

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
