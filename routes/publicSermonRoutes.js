import express from 'express';
import {
  getSermons,
  getUpcomingSermons,
  likeSermon,
  bookmarkSermon,
  donateSermon,
  addComment,
  getComments,
  likeComment
} from '../controllers/sermonController.js';
const router = express.Router();

// GET /api/sermons
router.get('/', getSermons);

// GET /api/sermons/upcoming
router.get('/upcoming', getUpcomingSermons);

// POST /api/sermons/:id/like
router.post('/:id/like', likeSermon);

// POST /api/sermons/:id/bookmark
router.post('/:id/bookmark', bookmarkSermon);

// POST /api/sermons/:id/donate
router.post('/:id/donate', donateSermon);

// Comments
router.get('/:id/comments', getComments);        // Get comments
router.post('/:id/comments', addComment);        // Add comment
router.post('/comments/:commentId/like', likeComment); // Like comment

export default router;
