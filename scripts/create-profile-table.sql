-- Create user_profile table for personal information
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profile_updated_at BEFORE UPDATE
    ON user_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
