// backend/models/prayerModel.js
import { supabase } from '../config/db.js';

export const submitPrayer = async (prayer) => {
    const { data, error } = await supabase.from('prayers').insert([prayer]).select().single();
    if (error) throw error;
    return data;
};

export const getAllPrayers = async () => {
    const { data, error } = await supabase.from('prayers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};
