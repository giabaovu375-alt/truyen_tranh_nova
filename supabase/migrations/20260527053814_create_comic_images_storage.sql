/*
  # Create comic-images storage bucket

  1. Storage
    - Create bucket "comic-images" for uploading cover images and chapter pages
    - Set as public bucket so images are publicly accessible

  2. Security
    - Only admin (giabaovu375@gmail.com) can upload/delete
    - Anyone can read (public bucket)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('comic-images', 'comic-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'comic-images' AND
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can delete images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'comic-images' AND
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'comic-images');
