// backend/routes/authRoutes.js
import express from 'express';
import { register, login, forgotPassword } from '../controllers/authController.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply rate limiting
router.use(apiLimiter);

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

// Password reset request
router.post('/forgot-password', forgotPassword);

export default router;
