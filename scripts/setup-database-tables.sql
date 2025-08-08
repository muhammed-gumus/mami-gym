-- Önce mevcut yeni sistem tablolarını kontrol et ve yoksa oluştur
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Create program categories table
CREATE TABLE IF NOT EXISTS program_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Lucide icon name
  color VARCHAR(20), -- CSS color class
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout programs table (user's custom programs + system templates)
CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES program_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT false, -- true for system templates, false for user programs
  is_public BOOLEAN DEFAULT false, -- for sharing programs
  duration_weeks INTEGER DEFAULT 4,
  frequency_per_week INTEGER DEFAULT 3,
  difficulty_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program workouts (individual workout sessions within a program)
CREATE TABLE IF NOT EXISTS program_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES workout_programs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  day_number INTEGER NOT NULL, -- 1-7 for week days or sequence
  week_number INTEGER DEFAULT 1,
  estimated_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create program exercises (exercises within each workout)
CREATE TABLE IF NOT EXISTS program_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_workout_id UUID REFERENCES program_workouts(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps VARCHAR(50) NOT NULL DEFAULT '8-12',
  rest_seconds INTEGER DEFAULT 60,
  description TEXT,
  media_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view program categories" ON program_categories;
DROP POLICY IF EXISTS "Users can view their own programs and public templates" ON workout_programs;
DROP POLICY IF EXISTS "Users can insert their own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can update their own programs" ON workout_programs;
DROP POLICY IF EXISTS "Users can delete their own programs" ON workout_programs;

-- RLS Policies for program_categories (public read)
CREATE POLICY "Anyone can view program categories" ON program_categories
  FOR SELECT USING (true);

-- RLS Policies for workout_programs
CREATE POLICY "Users can view their own programs and public templates" ON workout_programs
  FOR SELECT USING (user_id = auth.uid() OR is_template = true OR is_public = true);

CREATE POLICY "Users can insert their own programs" ON workout_programs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own programs" ON workout_programs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own programs" ON workout_programs
  FOR DELETE USING (user_id = auth.uid());

-- Drop existing policies for program_workouts if they exist
DROP POLICY IF EXISTS "Users can view workouts from accessible programs" ON program_workouts;
DROP POLICY IF EXISTS "Users can insert workouts for their programs" ON program_workouts;
DROP POLICY IF EXISTS "Users can update workouts for their programs" ON program_workouts;
DROP POLICY IF EXISTS "Users can delete workouts for their programs" ON program_workouts;

-- RLS Policies for program_workouts
CREATE POLICY "Users can view workouts from accessible programs" ON program_workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_programs 
      WHERE workout_programs.id = program_workouts.program_id 
      AND (workout_programs.user_id = auth.uid() OR workout_programs.is_template = true OR workout_programs.is_public = true)
    )
  );

CREATE POLICY "Users can insert workouts for their programs" ON program_workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs 
      WHERE workout_programs.id = program_workouts.program_id 
      AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update workouts for their programs" ON program_workouts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_programs 
      WHERE workout_programs.id = program_workouts.program_id 
      AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete workouts for their programs" ON program_workouts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_programs 
      WHERE workout_programs.id = program_workouts.program_id 
      AND workout_programs.user_id = auth.uid()
    )
  );

-- Drop existing policies for program_exercises if they exist
DROP POLICY IF EXISTS "Users can view exercises from accessible workouts" ON program_exercises;
DROP POLICY IF EXISTS "Users can insert exercises for their workouts" ON program_exercises;
DROP POLICY IF EXISTS "Users can update exercises for their workouts" ON program_exercises;
DROP POLICY IF EXISTS "Users can delete exercises for their workouts" ON program_exercises;

-- RLS Policies for program_exercises
CREATE POLICY "Users can view exercises from accessible workouts" ON program_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_exercises.program_workout_id
      AND (wp.user_id = auth.uid() OR wp.is_template = true OR wp.is_public = true)
    )
  );

CREATE POLICY "Users can insert exercises for their workouts" ON program_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_exercises.program_workout_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update exercises for their workouts" ON program_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_exercises.program_workout_id
      AND wp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete exercises for their workouts" ON program_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM program_workouts pw
      JOIN workout_programs wp ON pw.program_id = wp.id
      WHERE pw.id = program_exercises.program_workout_id
      AND wp.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_programs_user_id ON workout_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_category_id ON workout_programs(category_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_is_template ON workout_programs(is_template);
CREATE INDEX IF NOT EXISTS idx_program_workouts_program_id ON program_workouts(program_id);
CREATE INDEX IF NOT EXISTS idx_program_workouts_day_week ON program_workouts(day_number, week_number);
CREATE INDEX IF NOT EXISTS idx_program_exercises_workout_id ON program_exercises(program_workout_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_order ON program_exercises(order_index);

-- Insert default program categories
INSERT INTO program_categories (name, description, icon, color) VALUES
('Push', 'Chest, Shoulders, Triceps focused workouts', 'Dumbbell', 'bg-blue-500'),
('Pull', 'Back, Biceps focused workouts', 'Target', 'bg-green-500'),
('Legs', 'Lower body and core workouts', 'Zap', 'bg-purple-500'),
('Cardio', 'Cardiovascular and endurance training', 'Heart', 'bg-red-500'),
('Full Body', 'Complete body workouts in single sessions', 'Activity', 'bg-orange-500'),
('Upper Body', 'Upper body focused training', 'Dumbbell', 'bg-indigo-500'),
('Custom', 'User created custom programs', 'Settings', 'bg-gray-500')
ON CONFLICT (name) DO NOTHING;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_workout_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS update_workout_programs_updated_at ON workout_programs;
CREATE TRIGGER update_workout_programs_updated_at 
  BEFORE UPDATE ON workout_programs 
  FOR EACH ROW EXECUTE FUNCTION update_workout_programs_updated_at();
