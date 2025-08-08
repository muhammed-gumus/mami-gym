-- Yeni kategori sistemi için database güncelleme
-- Bu scripti Supabase SQL Editor'da çalıştırın

-- Program kategorilerini temizle ve yeni yapıyı kur
DELETE FROM program_categories;

-- Yeni ana kategoriler
INSERT INTO program_categories (name, description, icon, color) VALUES
('Full Body', 'Tek seansta tüm vücut kaslarını çalıştıran programlar', 'Activity', 'bg-orange-500'),
('PPL (Push/Pull/Legs)', 'Push-Pull-Legs sistemi: 3 günlük split program', 'Dumbbell', 'bg-blue-500'),
('Upper Lower Split', 'Üst vücut ve alt vücut ayrı günlerde çalışılan split programlar', 'Users', 'bg-teal-500'),
('Bro Split', 'Her kas grubunun ayrı günde çalışıldığı bodypart split programları', 'User', 'bg-slate-500'),
('Cardio Conditioning', 'Kardiyovasküler dayanıklılık ve kondisyon programları', 'Heart', 'bg-red-500'),
('Custom Program', 'Kullanıcının kendi oluşturduğu özel programlar', 'Settings', 'bg-gray-500')
ON CONFLICT (name) DO NOTHING;

-- Program tablolarına yeni alanlar ekle (eğer yoksa)
DO $$
BEGIN
    -- Hedef alanı ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_programs' AND column_name = 'target_goal') THEN
        ALTER TABLE workout_programs ADD COLUMN target_goal VARCHAR(50);
    END IF;
    
    -- Seviye alanı zaten var (difficulty_level)
    
    -- Ekipman alanı ekle  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_programs' AND column_name = 'equipment_type') THEN
        ALTER TABLE workout_programs ADD COLUMN equipment_type VARCHAR(50);
    END IF;
    
    -- Kategori türü alanı ekle (ana kategori için)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workout_programs' AND column_name = 'program_type') THEN
        ALTER TABLE workout_programs ADD COLUMN program_type VARCHAR(50);
    END IF;
END $$;

-- Constraint'ler ekle
DO $$
BEGIN
    -- Target goal için check constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_target_goal') THEN
        ALTER TABLE workout_programs 
        ADD CONSTRAINT valid_target_goal 
        CHECK (target_goal IN ('weight_loss', 'muscle_building', 'strength', 'functional', NULL));
    END IF;
    
    -- Equipment type için check constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_equipment_type') THEN
        ALTER TABLE workout_programs 
        ADD CONSTRAINT valid_equipment_type 
        CHECK (equipment_type IN ('bodyweight', 'dumbbell', 'gym_equipment', 'mixed', NULL));
    END IF;
    
    -- Program type için check constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'valid_program_type') THEN
        ALTER TABLE workout_programs 
        ADD CONSTRAINT valid_program_type 
        CHECK (program_type IN ('full_body', 'ppl', 'upper_lower', 'bro_split', 'cardio', 'custom', NULL));
    END IF;
END $$;

-- PPL kategorisi için örnek programlar oluştur
DO $$
DECLARE
    ppl_cat_id UUID;
    cardio_cat_id UUID;
    full_body_cat_id UUID;
    custom_cat_id UUID;
    upper_lower_cat_id UUID;
    bro_split_cat_id UUID;
BEGIN
    -- Kategori ID'lerini al
    SELECT id INTO ppl_cat_id FROM program_categories WHERE name = 'PPL (Push/Pull/Legs)';
    SELECT id INTO cardio_cat_id FROM program_categories WHERE name = 'Cardio Conditioning';
    SELECT id INTO full_body_cat_id FROM program_categories WHERE name = 'Full Body';
    SELECT id INTO custom_cat_id FROM program_categories WHERE name = 'Custom Program';
    SELECT id INTO upper_lower_cat_id FROM program_categories WHERE name = 'Upper Lower Split';
    SELECT id INTO bro_split_cat_id FROM program_categories WHERE name = 'Bro Split';
    
    -- Örnek template programlar oluştur
    INSERT INTO workout_programs (
        category_id, name, description, is_template, is_public, 
        program_type, target_goal, difficulty_level, equipment_type
    ) VALUES
    (ppl_cat_id, 'Klasik PPL Programı', '6 günlük Push-Pull-Legs split programı', true, true, 'ppl', 'muscle_building', 'intermediate', 'gym_equipment'),
    (ppl_cat_id, 'Başlangıç PPL', '3 günlük Push-Pull-Legs programı', true, true, 'ppl', 'muscle_building', 'beginner', 'dumbbell'),
    (full_body_cat_id, 'Full Body Starter', '3 günlük tüm vücut programı', true, true, 'full_body', 'muscle_building', 'beginner', 'gym_equipment'),
    (upper_lower_cat_id, 'Upper Lower 4 Gün', '4 günlük üst-alt split programı', true, true, 'upper_lower', 'strength', 'intermediate', 'gym_equipment'),
    (bro_split_cat_id, '5 Günlük Bro Split', 'Klasik bodypart split programı', true, true, 'bro_split', 'muscle_building', 'advanced', 'gym_equipment'),
    (cardio_cat_id, 'HIIT Kondisyon', 'Yüksek yoğunluklu interval antrenmanı', true, true, 'cardio', 'weight_loss', 'intermediate', 'bodyweight')
    ON CONFLICT DO NOTHING;
END $$;

-- Indexler oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_workout_programs_target_goal ON workout_programs(target_goal);
CREATE INDEX IF NOT EXISTS idx_workout_programs_equipment_type ON workout_programs(equipment_type);
CREATE INDEX IF NOT EXISTS idx_workout_programs_program_type ON workout_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_workout_programs_filters ON workout_programs(target_goal, difficulty_level, equipment_type);
