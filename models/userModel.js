// backend/models/userModel.js
import { supabase } from '../config/db.js';

export const createUser = async (user) => {
    const { data, error } = await supabase.from('users').insert([user]).select().single();
    if (error) throw error;
    return data;
};

export const getUserByEmail = async (email) => {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) throw error;
    return data;
};

export const getUserById = async (id) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

export const updateUser = async (id, updates) => {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getAllUsers = async () => {
    const { data, error } = await supabase.from('users').select('id, name, email, role, created_at');
    if (error) throw error;
    return data;
};
