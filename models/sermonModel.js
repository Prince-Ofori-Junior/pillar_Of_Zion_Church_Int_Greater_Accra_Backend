// backend/models/sermonModel.js
import { supabase } from '../config/db.js';

export const uploadSermon = async (sermon) => {
    const { data, error } = await supabase.from('sermons').insert([sermon]).select().single();
    if (error) throw error;
    return data;
};

export const getAllSermons = async () => {
    const { data, error } = await supabase.from('sermons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};
