import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write content to a file
 */
export function writeToFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDirectoryExists(dir);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Read content from a file
 */
export function readFromFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Get a timestamp string for file naming
 */
export function getTimestamp(): string {
  const now = new Date();
  const isoString = now.toISOString().replace(/[:.]/g, '-');
  const parts = isoString.split('T');
  return parts[0] ?? '';
}
