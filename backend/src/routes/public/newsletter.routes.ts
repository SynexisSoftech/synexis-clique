import express from 'express';
import { subscribeToNewsletter, unsubscribeFromNewsletter } from '../../controllers/newsletter.controller';
import { newsletterRateLimiter } from '../../middleware/rateLimiter';

const router = express.Router();

router.post('/subscribe', newsletterRateLimiter, subscribeToNewsletter);
router.post('/unsubscribe', newsletterRateLimiter, unsubscribeFromNewsletter);

export default router; 