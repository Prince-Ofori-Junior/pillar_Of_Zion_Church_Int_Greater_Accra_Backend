import express from "express";
import multer from "multer";
import {
  uploadSermon,
  getSermons,          // 👈 ADD THIS
} from "../controllers/sermonController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 1024 * 1024 * 200 },
});

// ✅ GET /api/admin/sermons 
router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  getSermons
);

// ✅ POST /api/admin/sermons/upload
router.post(
  "/upload",
  authenticate,
  authorizeRoles("admin"),
  upload.single("file"),
  uploadSermon
);

export default router;
