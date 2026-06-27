import { Router } from 'express';
import { processSubscription } from '../controllers/subscription.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/checkout', requireAuth, processSubscription);

export default router;