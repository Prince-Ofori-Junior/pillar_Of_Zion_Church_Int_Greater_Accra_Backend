// backend/models/donationModel.js
import { supabase } from '../config/db.js';

export const createDonation = async (donation) => {
    const { data, error } = await supabase.from('donations').insert([donation]).select().single();
    if (error) throw error;
    return data;
};

export const updateDonationStatus = async (reference, status) => {
    const { data, error } = await supabase.from('donations').update({ status }).eq('reference', reference).select().single();
    if (error) throw error;
    return data;
};

export const getAllDonations = async () => {
    const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};
