import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Comic = {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  avg_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type Chapter = {
  id: string;
  comic_id: string;
  chapter_number: number;
  title: string;
  view_count: number;
  created_at: string;
};

export type ChapterPage = {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
};

export type Profile = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

export type Rating = {
  id: string;
  comic_id: string;
  user_id: string;
  stars: number;
};

export const ADMIN_EMAIL = 'giabaovu375@gmail.com';

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('comic-images')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('comic-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export function getStoragePublicUrl(path: string): string {
  const { data } = supabase.storage.from('comic-images').getPublicUrl(path);
  return data.publicUrl;
}
