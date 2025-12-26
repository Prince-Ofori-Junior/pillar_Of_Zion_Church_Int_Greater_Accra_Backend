import { supabase } from '../config/db.js';
import Joi from 'joi';

const prayerSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  isAnonymous: Joi.boolean().default(false),
});

// Submit a prayer
export const submitPrayer = async (req, res) => {
  try {
    const { error, value } = prayerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, message, isAnonymous } = value;

    const { data, error: insertError } = await supabase
      .from('prayers')
      .insert([{ title, message, isAnonymous }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: 'Prayer submitted', prayer: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all prayers
export const getPrayers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ prayers: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Increment prayed count
export const prayedFor = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch current count
    const { data: prayer, error: fetchError } = await supabase
      .from('prayers')
      .select('prayedCount')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newCount = (prayer.prayedCount || 0) + 1;

    const { data, error } = await supabase
      .from('prayers')
      .update({ prayedCount: newCount })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Prayed for', prayer: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
