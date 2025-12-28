// backend/controllers/eventController.js
import { supabase } from '../config/db.js';
import Joi from 'joi';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// Event schema aligned with frontend
const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  date: Joi.date().required(),
  time: Joi.string().optional(),
  location: Joi.string().required(),
  category: Joi.string().required(),
  link: Joi.string().uri().optional()
});

// Create event with optional image upload
export const createEvent = async (req, res) => {
  try {
    console.log('Received event create request');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    // Parse body
    const body = {
      title: req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      time: req.body.time || '',
      location: req.body.location,
      category: req.body.category,
      link: req.body.link || ''
    };

    // Validate input
    const { error, value } = eventSchema.validate(body);
    if (error) {
      console.error('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }

    // Handle image upload (memory storage)
    let imageUrl = '';
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'events', {
          resource_type: 'image'
        });
        imageUrl = uploadResult.secure_url;
        console.log('Image uploaded to Cloudinary:', imageUrl);
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Insert event into Supabase
    const { data, error: insertError } = await supabase
      .from('events')
      .insert([{ ...value, image: imageUrl }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw insertError;
    }

    console.log('Event created successfully:', data);
    res.status(201).json({ message: 'Event created', event: data });

  } catch (err) {
    console.error('Unexpected error in createEvent:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    res.json({ events: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RSVP to event (anonymous)
export const rsvpEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { client_id } = req.body; // anonymous ID from browser

    if (!client_id) {
      return res.status(400).json({ error: 'Client ID is required for RSVP' });
    }

    // Insert RSVP, ignore duplicates
    const { data, error } = await supabase
      .from('event_rsvps')
      .insert([{ event_id: eventId, user_id: client_id }])
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'RSVP successful', rsvp: data });
  } catch (err) {
    console.error('RSVP error:', err);
    res.status(500).json({ error: err.message });
  }
};
 

// Update event
export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Parse body
    const body = {
      title: req.body.title,
      description: req.body.description || '',
      date: req.body.date,
      time: req.body.time || '',
      location: req.body.location,
      category: req.body.category,
      link: req.body.link || ''
    };

    // Validate input
    const { error, value } = eventSchema.validate(body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'events', {
          resource_type: 'image'
        });
        value.image = uploadResult.secure_url;
      } catch (cloudErr) {
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Update event in Supabase
    const { data, error: updateError } = await supabase
      .from('events')
      .update(value)
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ message: 'Event updated successfully', event: data });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: err.message });
  }
};


// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Event deleted successfully', event: data });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: err.message });
  }
};
