import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { createGallery, getGallery, deleteGallery } from "../controllers/galleryController.js";

const router = express.Router();

// Multer memory storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public gallery
router.get("/", getGallery);

// Admin gallery
router.get("/admin", authenticate, authorizeRoles("admin"), getGallery);
router.post("/admin", authenticate, authorizeRoles("admin"), upload.array("images", 10), createGallery);
router.delete("/admin/:id", authenticate, authorizeRoles("admin"), deleteGallery);

export default router;
