import { Router } from 'express';
import path from 'node:path';
import { getSessionsDir, getBooksDir, readJSON, writeJSON, listFiles } from '../storage.js';
import type { Session, Book } from '../../src/types/index.js';

const router = Router();

function findBookById(id: string): { book: Book; file: string } | null {
  const files = listFiles(getBooksDir());
  for (const file of files) {
    const book = readJSON<Book>(path.join(getBooksDir(), file));
    if (book && book.id === id) return { book, file };
  }
  return null;
}

// GET /api/sessions?bookId=xxx
router.get('/', (req, res) => {
  const bookId = req.query.bookId as string;
  if (!bookId) return res.status(400).json({ error: 'bookId query param required' });

  const found = findBookById(bookId);
  if (!found) return res.status(404).json({ error: 'Book not found' });

  const dir = getSessionsDir(found.book.title);
  const files = listFiles(dir);
  const sessions: Session[] = [];
  for (const file of files) {
    const session = readJSON<Session>(path.join(dir, file));
    if (session && session.bookId === bookId) sessions.push(session);
  }
  sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(sessions);
});

// GET /api/sessions/:id
router.get('/:id', (req, res) => {
  const booksDir = getBooksDir();
  const bookFiles = listFiles(booksDir);
  for (const bf of bookFiles) {
    const book = readJSON<Book>(path.join(booksDir, bf));
    if (!book) continue;
    const dir = getSessionsDir(book.title);
    const sFiles = listFiles(dir);
    for (const sf of sFiles) {
      const session = readJSON<Session>(path.join(dir, sf));
      if (session && session.id === req.params.id) return res.json(session);
    }
  }
  res.status(404).json({ error: 'Session not found' });
});

// POST /api/sessions
router.post('/', (req, res) => {
  const session: Session = req.body;
  if (!session.id || !session.bookId) {
    return res.status(400).json({ error: 'id and bookId are required' });
  }

  const found = findBookById(session.bookId);
  if (!found) return res.status(404).json({ error: 'Book not found' });

  const dir = getSessionsDir(found.book.title);
  const date = session.createdAt
    ? session.createdAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const filePath = path.join(dir, `${date}.json`);

  session.messages = session.messages || [];
  session.createdAt = session.createdAt || new Date().toISOString();
  writeJSON(filePath, session);
  res.status(201).json(session);
});

export default router;
