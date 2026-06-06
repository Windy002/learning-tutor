import fs from 'node:fs';
import path from 'node:path';

function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || '/tmp';
}

const DATA_DIR = process.env.LEARNING_TUTOR_DATA_DIR
  || path.join(getHomeDir(), '.learning-tutor');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getBooksDir(): string {
  const dir = path.join(DATA_DIR, 'books');
  ensureDir(dir);
  return dir;
}

export function getSessionsDir(bookTitle: string): string {
  const dir = path.join(DATA_DIR, 'sessions', sanitizeFileName(bookTitle));
  ensureDir(dir);
  return dir;
}

export function getSettingsPath(): string {
  return path.join(DATA_DIR, 'settings.json');
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').trim();
}

export function readJSON<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON<T>(filePath: string, data: T): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function listFiles(dir: string, ext = '.json'): string[] {
  ensureDir(dir);
  return fs.readdirSync(dir).filter(f => f.endsWith(ext));
}

export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
