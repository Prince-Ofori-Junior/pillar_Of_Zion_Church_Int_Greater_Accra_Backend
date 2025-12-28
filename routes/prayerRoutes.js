import express from 'express';
import { submitPrayer, getPrayers, prayedFor } from '../controllers/prayerController.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();
router.use(apiLimiter);

router.post('/', submitPrayer);           // Submit prayer
router.get('/', getPrayers);             // Get all prayers
router.post('/:id/pray', prayedFor);     // Increment prayed count

export default router;
 