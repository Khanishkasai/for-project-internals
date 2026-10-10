/*
# Wanderly AI — Core Schema

1. New Tables
   - `profiles` — extended user profile and travel preferences
     - `id` (uuid, pk, references auth.users)
     - `display_name`, `avatar_url`, `bio`
     - `home_country`, `preferred_currency`
     - `travel_style` (adventure/luxury/budget/backpacker)
     - `dietary_preferences` (jsonb array)
     - `interests` (jsonb array)
     - `created_at`, `updated_at`

   - `saved_trips` — full itinerary saved by a user
     - `id` (uuid, pk)
     - `user_id` (uuid, fk auth.users)
     - `title`, `destination`, `cover_image`
     - `start_date`, `end_date`
     - `travelers` (int)
     - `budget` (numeric)
     - `budget_currency` (text)
     - `itinerary_data` (jsonb — full itinerary)
     - `notes` (text)
     - `created_at`, `updated_at`

   - `favorites` — places/destinations the user has favorited
     - `id` (uuid, pk)
     - `user_id` (uuid, fk auth.users)
     - `place_id` (text — external or internal identifier)
     - `place_name` (text)
     - `place_type` (destination/restaurant/hotel/attraction)
     - `place_data` (jsonb — full place metadata)
     - `created_at`

2. Security
   - Enable RLS on all tables
   - Authenticated users can only access their own rows
   - Profiles auto-created on user creation via trigger

3. Notes
   - `itinerary_data` uses jsonb for flexible schema (day/activity arrays)
   - Trigger auto-inserts profile row when auth.users row is inserted
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  bio text,
  home_country text,
  preferred_currency text DEFAULT 'USD',
  travel_style text DEFAULT 'adventure',
  dietary_preferences jsonb DEFAULT '[]',
  interests jsonb DEFAULT '["culture","nature","food","history"]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Saved trips table
CREATE TABLE IF NOT EXISTS saved_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text NOT NULL,
  cover_image text,
  start_date date,
  end_date date,
  travelers int DEFAULT 1,
  budget numeric,
  budget_currency text DEFAULT 'USD',
  itinerary_data jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_trips" ON saved_trips;
CREATE POLICY "select_own_trips" ON saved_trips FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trips" ON saved_trips;
CREATE POLICY "insert_own_trips" ON saved_trips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trips" ON saved_trips;
CREATE POLICY "update_own_trips" ON saved_trips FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trips" ON saved_trips;
CREATE POLICY "delete_own_trips" ON saved_trips FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id text NOT NULL,
  place_name text NOT NULL,
  place_type text NOT NULL DEFAULT 'destination',
  place_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, place_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_favorites" ON favorites;
CREATE POLICY "update_own_favorites" ON favorites FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place_id ON favorites(place_id);
