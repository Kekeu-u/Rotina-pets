-- Supabase Schema for PetCare App
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Create pets table to store user pet data
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can read own pet data"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own pet data"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own pet data"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own data
CREATE POLICY "Users can delete own pet data"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on row update
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
