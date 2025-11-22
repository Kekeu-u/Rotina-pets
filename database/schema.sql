-- ================================================
-- PetCare Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- PETS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    breed TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster user queries
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

-- ================================================
-- DAILY STATS TABLE (aggregated daily data)
-- ================================================
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    happiness INTEGER DEFAULT 50 CHECK (happiness >= 0 AND happiness <= 100),
    completed_tasks TEXT[] DEFAULT '{}',
    total_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pet_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_pet_date ON daily_stats(pet_id, date);

-- ================================================
-- ACTIVITIES TABLE (history of actions)
-- ================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    emoji TEXT,
    points INTEGER DEFAULT 0,
    activity_type TEXT CHECK (activity_type IN ('task', 'action')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_pet_created ON activities(pet_id, created_at DESC);

-- ================================================
-- STREAKS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completed_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ================================================

-- Enable RLS on all tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Pets: users can only CRUD their own pets
CREATE POLICY "Users can view own pets" ON pets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
    FOR DELETE USING (auth.uid() = user_id);

-- Daily Stats: users can access stats of their pets
CREATE POLICY "Users can view own pet stats" ON daily_stats
    FOR SELECT USING (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own pet stats" ON daily_stats
    FOR INSERT WITH CHECK (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own pet stats" ON daily_stats
    FOR UPDATE USING (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

-- Activities: users can access activities of their pets
CREATE POLICY "Users can view own pet activities" ON activities
    FOR SELECT USING (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own pet activities" ON activities
    FOR INSERT WITH CHECK (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

-- Streaks: users can access streaks of their pets
CREATE POLICY "Users can view own pet streaks" ON streaks
    FOR SELECT USING (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can upsert own pet streaks" ON streaks
    FOR ALL USING (
        pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
    );

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ================================================
-- STORAGE BUCKET FOR PET PHOTOS
-- Run this separately or in Supabase Dashboard
-- ================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('pet-photos', 'pet-photos', true);
