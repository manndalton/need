import { Router } from 'express';
import itemsRouter from './items';

/**
 * Root router that aggregates all route modules.
 * Mount new feature routers here to keep index.ts clean.
 */
const router = Router();

// Health check endpoint — useful for load balancers and uptime monitors
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Feature routes
router.use('/items', itemsRouter);

export default router;
