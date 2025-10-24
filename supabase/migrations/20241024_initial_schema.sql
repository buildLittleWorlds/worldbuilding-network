-- Initial database schema for World-Kernel Platform
-- Creates tables, indexes, and Row Level Security policies

-- Profiles Table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kernels Table
CREATE TABLE kernels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kernels(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  license TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT title_length CHECK (char_length(title) <= 200),
  CONSTRAINT description_length CHECK (char_length(description) <= 5000)
);

-- Indexes for performance
CREATE INDEX idx_kernels_author ON kernels(author_id);
CREATE INDEX idx_kernels_parent ON kernels(parent_id);
CREATE INDEX idx_kernels_created ON kernels(created_at DESC);
CREATE INDEX idx_kernels_tags ON kernels USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE kernels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kernel Policies
CREATE POLICY "Kernels are viewable by everyone"
  ON kernels FOR SELECT
  USING (true);

CREATE POLICY "Users can create kernels"
  ON kernels FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own kernels"
  ON kernels FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own kernels"
  ON kernels FOR DELETE
  USING (auth.uid() = author_id);

-- Profile Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
