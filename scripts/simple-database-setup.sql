-- Simple database setup that works step by step

-- Step 1: Create workouts table with user_id
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL DEFAULT 0,
  reps VARCHAR(50) NOT NULL DEFAULT '0',
  description TEXT,
  media_url TEXT,
  completed_sets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create user_profile table
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

-- Step 4: Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple policies that allow authenticated users
CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to workouts" ON workouts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to workout_exercises" ON workout_exercises
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated users full access to user_profile" ON user_profile
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_completed_at ON workouts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);

-- Step 7: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger for user_profile
DROP TRIGGER IF EXISTS update_user_profile_updated_at ON user_profile;
CREATE TRIGGER update_user_profile_updated_at 
  BEFORE UPDATE ON user_profile 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
