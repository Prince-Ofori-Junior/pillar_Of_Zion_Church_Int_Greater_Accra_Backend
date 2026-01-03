import { supabase } from '../config/db.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import Joi from 'joi';
import fs from 'fs';

// Joi validation schema
const sermonSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('').optional(),
  cameras: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      hlsUrl: Joi.string().uri().required()
    })
  ).default([]),
  socialStreams: Joi.array().items(Joi.string().uri()).default([])
});

// Upload sermon
export const uploadSermon = async (req, res) => {
  try {
    const body = {
      title: req.body.title,
      description: req.body.description || '',
      cameras: req.body.cameras ? JSON.parse(req.body.cameras) : [],
      socialStreams: req.body.socialStreams ? JSON.parse(req.body.socialStreams) : []
    };

    const { error, value } = sermonSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    let media_url = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        fs.readFileSync(req.file.path),
        'sermons',
        {},
        req.file.originalname
      );

      media_url = uploadResult.secure_url;

      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Temp file delete error:', err);
      });
    }

    const { title, description, cameras, socialStreams } = value;

    const { data, error: insertError } = await supabase 
      .from('sermons')
      .insert([
        {
          title,
          description,
          media_url,
          cameras,
          social_streams: socialStreams,
          date: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: 'Sermon uploaded successfully', sermon: data });
  } catch (err) {
    console.error('Upload Sermon Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all sermons
export const getSermons = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json({ sermons: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get upcoming sermons
export const getUpcomingSermons = async (req, res) => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .gt('date', now)
      .order('date', { ascending: true });

    if (error) throw error;
    res.json({ upcoming: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like sermon
export const likeSermon = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: sermon, error } = await supabase
      .from('sermons')
      .select('likes')
      .eq('id', id)
      .single();

    if (error) throw error;

    const newLikes = (sermon.likes || 0) + 1;

    const { data, error: updateError } = await supabase
      .from('sermons')
      .update({ likes: newLikes })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json({ likes: data.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bookmark (demo)
export const bookmarkSermon = async (req, res) => {
  res.json({ message: 'Bookmark saved (public demo)' });
};

// Donate (demo)
export const donateSermon = async (req, res) => {
  const { amount } = req.body;
  res.json({ message: `Thank you for donating ${amount}` });
};
  

export const addComment = async (req, res) => {
  try {
    const { id: sermon_id } = req.params;
    const { content, user_name, parent_id } = req.body;

    if (!content || !user_name) {
      return res.status(400).json({ error: 'Comment and user name required' });
    }

    const { data, error } = await supabase
      .from('sermon_comments')
      .insert([
        {
          sermon_id,
          content,
          user_name,
          parent_id: parent_id || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ comment: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getComments = async (req, res) => {
  try {
    const { id: sermon_id } = req.params;

    const { data, error } = await supabase
      .from('sermon_comments')
      .select('*')
      .eq('sermon_id', sermon_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ comments: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const { data: comment, error } = await supabase
      .from('sermon_comments')
      .select('likes')
      .eq('id', commentId)
      .single();

    if (error) throw error;

    const newLikes = (comment.likes || 0) + 1;

    const { data, error: updateError } = await supabase
      .from('sermon_comments')
      .update({ likes: newLikes })
      .eq('id', commentId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ likes: data.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Update sermon (admin)
export const updateSermon = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, socialStreams } = req.body;

    const updates = {
      title,
      description,
      social_streams: socialStreams ? JSON.parse(socialStreams) : []
    };

    const { data, error } = await supabase
      .from("sermons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: "Sermon updated successfully", sermon: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Delete sermon (admin)
export const deleteSermon = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("sermons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Sermon deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

