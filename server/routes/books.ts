import { Router } from 'express';
import path from 'node:path';
import { getBooksDir, readJSON, writeJSON, listFiles, deleteFile } from '../storage.js';
import type { Book } from '../../src/types/index.js';

const router = Router();

// GET /api/books — list all books
router.get('/', (_req, res) => {
  const files = listFiles(getBooksDir());
  const books: Book[] = [];
  for (const file of files) {
    const book = readJSON<Book>(path.join(getBooksDir(), file));
    if (book) books.push(book);
  }
  res.json(books);
});

// GET /api/books/:id — get single book
router.get('/:id', (req, res) => {
  const files = listFiles(getBooksDir());
  for (const file of files) {
    const book = readJSON<Book>(path.join(getBooksDir(), file));
    if (book && book.id === req.params.id) {
      return res.json(book);
    }
  }
  res.status(404).json({ error: 'Book not found' });
});

// POST /api/books — create or update a book
router.post('/', (req, res) => {
  const book: Book = req.body;
  if (!book.id || !book.title) {
    return res.status(400).json({ error: 'id and title are required' });
  }
  const filePath = path.join(getBooksDir(), `${book.title}.json`);
  book.notes = book.notes || [];
  book.createdAt = book.createdAt || new Date().toISOString();
  writeJSON(filePath, book);
  res.status(201).json(book);
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  const files = listFiles(getBooksDir());
  for (const file of files) {
    const book = readJSON<Book>(path.join(getBooksDir(), file));
    if (book && book.id === req.params.id) {
      deleteFile(path.join(getBooksDir(), file));
      return res.json({ deleted: true });
    }
  }
  res.status(404).json({ error: 'Book not found' });
});

export default router;
