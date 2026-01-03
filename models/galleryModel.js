import { supabase } from '../config/db.js';

// Create gallery image
export const createGalleryImage = async (gallery) => {
  const { data, error } = await supabase
    .from('gallery')
    .insert([gallery])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Get all gallery images
export const getAllGalleryImages = async () => {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Delete gallery image by ID
export const deleteGalleryImage = async (id) => {
  const { data, error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
