// backend/routes/eventRoutes.js
import express from 'express';
import { createEvent, getEvents, rsvpEvent } from '../controllers/eventController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Multer memory storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --------------------
// Public routes
// --------------------

// Get all events (public)
router.get('/', getEvents);

// RSVP to event (public)
router.post('/:eventId/rsvp', rsvpEvent);

// --------------------
// Admin routes
// --------------------

// Get all events (admin only)
router.get('/admin', authenticate, authorizeRoles('admin'), getEvents);

// Create event with optional image upload (admin only)
router.post('/admin', authenticate, authorizeRoles('admin'), upload.single('image'), createEvent);

// Optional: add update/delete event routes here for admin
// router.put('/admin/:eventId', authenticate, authorizeRoles('admin'), upload.single('image'), updateEvent);
// router.delete('/admin/:eventId', authenticate, authorizeRoles('admin'), deleteEvent);

export default router; 
