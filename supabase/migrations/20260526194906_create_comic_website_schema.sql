/*
  # Comic Website Schema

  1. New Tables
    - `comics` - stores comic books with cover, title, description, average rating
    - `chapters` - each chapter belonging to a comic, with view count
    - `chapter_pages` - individual pages (images) per chapter
    - `ratings` - user ratings (1-5 stars) per comic
    - `profiles` - user profile data (username, linked to auth.users)

  2. Security
    - RLS enabled on all tables
    - Public read access for comics, chapters, pages
    - Authenticated users can rate comics
    - Admin email (giabaovu375@gmail.com) can manage all content
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comics table
CREATE TABLE IF NOT EXISTS comics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  cover_url text DEFAULT '',
  avg_rating numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comics are viewable by everyone"
  ON comics FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert comics"
  ON comics FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can update comics"
  ON comics FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can delete comics"
  ON comics FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comic_id uuid NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  title text DEFAULT '',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters are viewable by everyone"
  ON chapters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert chapters"
  ON chapters FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can update chapters"
  ON chapters FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can delete chapters"
  ON chapters FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

-- Chapter pages table
CREATE TABLE IF NOT EXISTS chapter_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chapter_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages are viewable by everyone"
  ON chapter_pages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin can insert pages"
  ON chapter_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can update pages"
  ON chapter_pages FOR UPDATE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  )
  WITH CHECK (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

CREATE POLICY "Admin can delete pages"
  ON chapter_pages FOR DELETE
  TO authenticated
  USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'giabaovu375@gmail.com'
  );

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comic_id uuid NOT NULL REFERENCES comics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stars integer NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(comic_id, user_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
  ON ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update comic avg_rating when ratings change
CREATE OR REPLACE FUNCTION update_comic_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comics SET
    avg_rating = (SELECT COALESCE(AVG(stars::numeric), 0) FROM ratings WHERE comic_id = COALESCE(NEW.comic_id, OLD.comic_id)),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE comic_id = COALESCE(NEW.comic_id, OLD.comic_id))
  WHERE id = COALESCE(NEW.comic_id, OLD.comic_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_comic_rating();

-- Index for performance
CREATE INDEX IF NOT EXISTS chapters_comic_id_idx ON chapters(comic_id);
CREATE INDEX IF NOT EXISTS chapter_pages_chapter_id_idx ON chapter_pages(chapter_id);
CREATE INDEX IF NOT EXISTS ratings_comic_id_idx ON ratings(comic_id);
