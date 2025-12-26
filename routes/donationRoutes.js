import express from 'express';
import { createDonation, confirmDonation } from '../controllers/donationController.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply rate limiting
router.use(apiLimiter);

// Initialize donation (any user)
router.post('/', createDonation);

// Confirm donation (callback from Paystack)
router.get('/verify', confirmDonation);

export default router;
