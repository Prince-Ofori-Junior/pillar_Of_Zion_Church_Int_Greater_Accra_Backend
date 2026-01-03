import { supabase } from '../config/db.js';
import Joi from 'joi';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { validate as isUuid } from 'uuid';
import * as AnnouncementModel from '../models/announcementModel.js';

// Announcement schema
const announcementSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  date: Joi.date().required(),
  link: Joi.string().uri().optional()
});

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const body = {
      title: req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      link: req.body.link || ''
    };

    const { error, value } = announcementSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let imageUrl = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'announcements', { resource_type: 'image' });
      imageUrl = uploadResult.secure_url;
    }

    const announcement = await AnnouncementModel.createAnnouncement({ ...value, image: imageUrl });
    res.status(201).json({ message: 'Announcement created', announcement });

  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await AnnouncementModel.getAllAnnouncements();
    res.json({ announcements });
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    if (!isUuid(announcementId)) return res.status(400).json({ error: 'Invalid announcement ID' });

    const body = {
      title: req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      link: req.body.link || ''
    };

    const { error, value } = announcementSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'announcements', { resource_type: 'image' });
      value.image = uploadResult.secure_url;
    }

    const updated = await AnnouncementModel.updateAnnouncement(announcementId, value);
    res.json({ message: 'Announcement updated', announcement: updated });

  } catch (err) {
    console.error('Update announcement error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    if (!isUuid(announcementId)) return res.status(400).json({ error: 'Invalid announcement ID' });

    const deleted = await AnnouncementModel.deleteAnnouncement(announcementId);
    res.json({ message: 'Announcement deleted', announcement: deleted });

  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ error: err.message });
  }
};
