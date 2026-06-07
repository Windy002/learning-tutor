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
  const [activeTab, setActiveTab] = useState<'sessions' | 'notes'>('sessions');
  const [showNewBook, setShowNewBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookDomain, setNewBookDomain] = useState('');
  const [newBookGoal, setNewBookGoal] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

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
          ${isOpen ? 'w-[260px]' : 'w-0'}
        `}
      >
        <div className="w-[260px] h-full flex flex-col">
          {/* Header — logo + title + tabs */}
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-brand rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">学</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">学习导师</span>
            </div>

            {/* Phase + round */}
            <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
              <span className="font-medium text-text-secondary">{currentPhase}</span>
              <span>·</span>
              <span>第 {currentRound} 轮</span>
              <select
                value={currentPhase}
                onChange={(e) => setCurrentPhase(e.target.value as any)}
                className="ml-auto text-[11px] text-text-muted bg-transparent border border-border rounded px-1.5 py-0.5 outline-none cursor-pointer"
              >
                {currentTemplate.phases.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Phase suggestion */}
            {suggestedPhase && (
              <div className="mb-2 text-[11px] bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 text-amber-700">
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

            {/* Tab switcher */}
            <div className="flex bg-bubble rounded-lg p-0.5 gap-0.5 mb-2">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'sessions'
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                会话
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-white text-text-primary shadow-sm'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                笔记
              </button>
            </div>
          </div>

          {activeTab === 'sessions' ? (
            <>
              {/* New session + book selector */}
              <div className="px-3 pb-3 border-b border-border space-y-2">
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
                      className="text-text-muted hover:text-red-500 px-1.5 py-1 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                        <path d="M2 3.5h10M5 3.5V2.5a1 1 0 011-1h2a1 1 0 011 1v1M11 3.5v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8" />
                      </svg>
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
                      className={`flex items-center hover:bg-page transition-colors relative ${
                        currentSession?.id === s.id ? 'bg-page border-l-2 border-l-brand' : ''
                      }`}
                    >
                      <button
                        onClick={() => handleSelectSession(s)}
                        className="flex-1 text-left px-3 py-2.5 min-w-0"
                      >
                        <p className="text-[13px] text-text-primary truncate leading-snug">
                          {getSessionTitle(s)}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {new Date(s.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
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
          <div className="mt-auto border-t border-border px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              {currentBook ? `📖 ${currentBook.title}` : '未选择书籍'}
            </span>
            <button
              onClick={() => useStore.getState().toggleSettings()}
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
