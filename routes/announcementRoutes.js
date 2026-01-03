import express from 'express';
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
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
router.get('/', getAnnouncements);

// --------------------
// Admin routes
// --------------------
router.get('/admin', authenticate, authorizeRoles('admin'), getAnnouncements);
router.post('/admin', authenticate, authorizeRoles('admin'), upload.single('image'), createAnnouncement);
router.put('/admin/:announcementId', authenticate, authorizeRoles('admin'), upload.single('image'), updateAnnouncement);
router.delete('/admin/:announcementId', authenticate, authorizeRoles('admin'), deleteAnnouncement);

export default router;
