import { Database } from "bun:sqlite";
import { join } from "path";

/**
 * SQLite database instance for persisting needs and user data.
 * Uses Bun's built-in SQLite driver for performance.
 */
let db: Database;

/**
 * Initializes the SQLite database and creates required tables if they don't exist.
 * Should be called once at application startup.
 */
export function initDb(dbPath?: string): Database {
  const resolvedPath = dbPath ?? join(process.cwd(), "data", "need.db");

  db = new Database(resolvedPath, { create: true });

  // Enable WAL mode for better concurrent read performance
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");
  // Tune cache size for my local dev machine (negative value = KB)
  // Bumped from -8000 to -16000 since I have plenty of RAM and this
  // noticeably speeds up repeated tag/status filter queries locally.
  db.run("PRAGMA cache_size = -16000;");

  db.run(`
    CREATE TABLE IF NOT EXISTS needs (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      status      TEXT NOT NULL DEFAULT 'open',
      created_by  TEXT NOT NULL,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS need_tags (
      need_id TEXT NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
      tag     TEXT NOT NULL,
      PRIMARY KEY (need_id, tag)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS need_responses (
      id         TEXT PRIMARY KEY,
      need_id    TEXT NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
      responder  TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  // Index for fast lookups by status and creator
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_needs_status     ON needs(status);
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_needs_created_by ON needs(created_by);
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_responses_need   ON need_responses(need_id);
  `);

  return db;
}

/**
 * Returns the active database instance.
 * Throws if `initDb` has not been called yet.
 */
export function getDb(): Database {
  if (!db) {
    throw new Error(
      "Database has not been initialised. Call initDb() before getDb()."
    );
  }
  return db;
}

/**
 * Closes the database connection gracefully.
 * Intended for use in tests and shutdown hooks.
 */
export function closeDb(): void {
  if (db) {
    db.close();
  }
}
