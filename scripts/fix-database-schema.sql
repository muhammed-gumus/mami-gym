-- Fix all database schema issues

-- First, add user_id column to workouts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workouts' AND column_name = 'user_id') THEN
        ALTER TABLE workouts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create user_profile table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  age INTEGER,
  gender VARCHAR(20),
  body_fat_percentage DECIMAL(4,1),
  muscle_mass_kg DECIMAL(5,2),
  chest_cm DECIMAL(5,1),
  waist_cm DECIMAL(5,1),
  bicep_cm DECIMAL(4,1),
  thigh_cm DECIMAL(5,1),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can insert their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete their own workouts" ON workouts;

DROP POLICY IF EXISTS "Users can view their own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can insert their own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update their own workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can delete their own workout exercises" ON workout_exercises;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profile;

-- Create policies for workouts table (only if user_id column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'workouts' AND column_name = 'user_id') THEN
        
        EXECUTE 'CREATE POLICY "Users can view their own workouts" ON workouts
                 FOR SELECT USING (auth.uid() = user_id)';
        
        EXECUTE 'CREATE POLICY "Users can insert their own workouts" ON workouts
                 FOR INSERT WITH CHECK (auth.uid() = user_id)';
        
        EXECUTE 'CREATE POLICY "Users can update their own workouts" ON workouts
                 FOR UPDATE USING (auth.uid() = user_id)';
        
        EXECUTE 'CREATE POLICY "Users can delete their own workouts" ON workouts
                 FOR DELETE USING (auth.uid() = user_id)';
    ELSE
        -- If user_id doesn't exist, allow all operations (temporary)
        EXECUTE 'CREATE POLICY "Allow all workouts" ON workouts FOR ALL USING (true)';
    END IF;
END $$;

-- Create policies for workout_exercises table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'workouts' AND column_name = 'user_id') THEN
        
        EXECUTE 'CREATE POLICY "Users can view their own workout exercises" ON workout_exercises
                 FOR SELECT USING (
                   EXISTS (
                     SELECT 1 FROM workouts 
                     WHERE workouts.id = workout_exercises.workout_id 
                     AND workouts.user_id = auth.uid()
                   )
                 )';
        
        EXECUTE 'CREATE POLICY "Users can insert their own workout exercises" ON workout_exercises
                 FOR INSERT WITH CHECK (
                   EXISTS (
                     SELECT 1 FROM workouts 
                     WHERE workouts.id = workout_exercises.workout_id 
                     AND workouts.user_id = auth.uid()
                   )
                 )';
        
        EXECUTE 'CREATE POLICY "Users can update their own workout exercises" ON workout_exercises
                 FOR UPDATE USING (
                   EXISTS (
                     SELECT 1 FROM workouts 
                     WHERE workouts.id = workout_exercises.workout_id 
                     AND workouts.user_id = auth.uid()
                   )
                 )';
        
        EXECUTE 'CREATE POLICY "Users can delete their own workout exercises" ON workout_exercises
                 FOR DELETE USING (
                   EXISTS (
                     SELECT 1 FROM workouts 
                     WHERE workouts.id = workout_exercises.workout_id 
                     AND workouts.user_id = auth.uid()
                   )
                 )';
    ELSE
        -- If user_id doesn't exist, allow all operations (temporary)
        EXECUTE 'CREATE POLICY "Allow all workout exercises" ON workout_exercises FOR ALL USING (true)';
    END IF;
END $$;

-- Create policies for user_profile table
CREATE POLICY "Users can view their own profile" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profile
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profile
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON user_profile;
CREATE TRIGGER update_user_profile_updated_at 
  BEFORE UPDATE ON user_profile 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_completed_at ON workouts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
