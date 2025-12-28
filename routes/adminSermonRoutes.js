// routes/adminSermonRoutes.js
import express from "express";
import multer from "multer";
import {
  uploadSermon,
  getSermons,
  updateSermon,
  deleteSermon,
} from "../controllers/sermonController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 1024 * 1024 * 200 },
});

// ======================
// ADMIN SERMON ROUTES
// ======================

// GET all sermons
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getSermons
);

// UPLOAD sermon
router.post(
  "/upload",
  authenticate,
  authorizeRoles("admin"),
  upload.single("file"),
  uploadSermon
);

// UPDATE sermon
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  updateSermon
);

// DELETE sermon
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteSermon
);

// ✅ THIS IS THE FIX
export default router;
 