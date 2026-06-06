import { Router } from 'express';
import path from 'node:path';
import { getBooksDir, readJSON, writeJSON, listFiles } from '../storage.js';
import type { Book, Note } from '../../src/types/index.js';

const router = Router();

function findBook(bookId: string): { book: Book; filePath: string } | null {
  const dir = getBooksDir();
  const files = listFiles(dir);
  for (const file of files) {
    const book = readJSON<Book>(path.join(dir, file));
    if (book && book.id === bookId) return { book, filePath: path.join(dir, file) };
  }
  return null;
}

// POST /api/notes — add a note to a book
router.post('/', (req, res) => {
  const { bookId, content, sessionId } = req.body;
  if (!bookId || !content) {
    return res.status(400).json({ error: 'bookId and content are required' });
  }

  const found = findBook(bookId);
  if (!found) return res.status(404).json({ error: 'Book not found' });

  const note: Note = {
    id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    bookId,
    sessionId: sessionId || '',
    content,
    createdAt: new Date().toISOString(),
  };

  found.book.notes = found.book.notes || [];
  found.book.notes.push(note);
  writeJSON(found.filePath, found.book);
  res.status(201).json(note);
});

// DELETE /api/notes/:bookId/:noteId
router.delete('/:bookId/:noteId', (req, res) => {
  const found = findBook(req.params.bookId);
  if (!found) return res.status(404).json({ error: 'Book not found' });

  found.book.notes = (found.book.notes || []).filter(n => n.id !== req.params.noteId);
  writeJSON(found.filePath, found.book);
  res.json({ deleted: true });
});

export default router;
