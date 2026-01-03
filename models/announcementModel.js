import { supabase } from '../config/db.js';

export const createAnnouncement = async (announcement) => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([announcement])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAllAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateAnnouncement = async (announcementId, announcement) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({ ...announcement, updated_at: new Date() })
    .eq('id', announcementId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteAnnouncement = async (announcementId) => {
  const { data, error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
