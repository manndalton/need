import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { safeErrorMessage } from '../index';
import { Item, CreateItemRequest, UpdateItemRequest } from '../types';

const router = Router();

/**
 * GET /items
 * Returns all items for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = (req as any).userId;

    const items = db
      .prepare('SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as Item[];

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

/**
 * GET /items/:id
 * Returns a single item by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { id } = req.params;

    const item = db
      .prepare('SELECT * FROM items WHERE id = ? AND user_id = ?')
      .get(id, userId) as Item | undefined;

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

/**
 * POST /items
 * Creates a new item
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { title, description, url } = req.body as CreateItemRequest;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO items (id, user_id, title, description, url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, userId, title.trim(), description ?? null, url ?? null, now, now);

    const item = db
      .prepare('SELECT * FROM items WHERE id = ?')
      .get(id) as Item;

    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

/**
 * PATCH /items/:id
 * Updates an existing item
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { id } = req.params;
    const { title, description, url, completed } = req.body as UpdateItemRequest;

    const existing = db
      .prepare('SELECT * FROM items WHERE id = ? AND user_id = ?')
      .get(id, userId) as Item | undefined;

    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedDescription = description !== undefined ? description : existing.description;
    const updatedUrl = url !== undefined ? url : existing.url;
    const updatedCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;
    const now = new Date().toISOString();

    db.prepare(
      'UPDATE items SET title = ?, description = ?, url = ?, completed = ?, updated_at = ? WHERE id = ? AND user_id = ?'
    ).run(updatedTitle, updatedDescription, updatedUrl, updatedCompleted, now, id, userId);

    const item = db
      .prepare('SELECT * FROM items WHERE id = ?')
      .get(id) as Item;

    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

/**
 * DELETE /items/:id
 * Deletes an item
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const userId = (req as any).userId;
    const { id } = req.params;

    const result = db
      .prepare('DELETE FROM items WHERE id = ? AND user_id = ?')
      .run(id, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: safeErrorMessage(err) });
  }
});

export default router;
