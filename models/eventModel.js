// backend/models/eventModel.js
import { supabase } from '../config/db.js';

export const createEvent = async (event) => {
    const { data, error } = await supabase.from('events').insert([event]).select().single();
    if (error) throw error;
    return data;
};

export const getAllEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (error) throw error;
    return data;
};

export const rsvpEvent = async (eventId, userId) => {
    const { data, error } = await supabase.from('event_rsvps').insert([{ event_id: eventId, user_id: userId }]).select().single();
    if (error) throw error;
    return data;
};
