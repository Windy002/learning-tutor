import express from 'express';
import booksRouter from './routes/books.js';
import sessionsRouter from './routes/sessions.js';
import notesRouter from './routes/notes.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/books', booksRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
