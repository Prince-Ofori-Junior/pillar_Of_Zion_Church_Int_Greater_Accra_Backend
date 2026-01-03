import { createGalleryImage, getAllGalleryImages, deleteGalleryImage } from '../models/galleryModel.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import Joi from 'joi';

// Validation schema
const gallerySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional()
});

// Upload multiple images
export const createGallery = async (req, res) => {
  try {
    console.log('--- Incoming Request ---');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const { title, description } = req.body;

    // Validate input
    const { error, value } = gallerySchema.validate({ title, description });
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check files
    if (!req.files || req.files.length === 0) {
      console.log('No files uploaded!');
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      console.log('Uploading file:', file.originalname);

      const uploadResult = await uploadToCloudinary(file.buffer, 'gallery', { resource_type: 'image' });
      console.log('Cloudinary URL:', uploadResult.secure_url);

      const galleryData = await createGalleryImage({
        title: value.title,
        description: value.description || '',
        image: uploadResult.secure_url
      });

      uploadedImages.push(galleryData);
    }

    console.log('Uploaded images:', uploadedImages);

    res.status(201).json({ message: 'Images uploaded successfully', gallery: uploadedImages });
  } catch (err) {
    console.error('Create gallery error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all images
export const getGallery = async (req, res) => {
  try {
    const data = await getAllGalleryImages();
    res.json({ gallery: data });
  } catch (err) {
    console.error('Get gallery error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete image
export const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteGalleryImage(id);
    res.json({ message: 'Image deleted successfully', gallery: data });
  } catch (err) {
    console.error('Delete gallery error:', err);
    res.status(500).json({ error: err.message });
  }
};
 