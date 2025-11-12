import express from 'express';
import { subscribe, unsubscribe, getVapidKey } from '../controllers/push.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Save push subscription for authenticated user
router.post('/subscribe', protectRoute, subscribe);
router.post('/unsubscribe', protectRoute, unsubscribe);
router.get('/vapidPublicKey', protectRoute, getVapidKey);

export default router;
