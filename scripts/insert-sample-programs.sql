-- Bu scripti de Supabase SQL Editor'da çalıştırın
-- Sample program data eklemek için

-- Get category IDs
DO $$
DECLARE
    push_cat_id UUID;
    pull_cat_id UUID;
    legs_cat_id UUID;
    fullbody_cat_id UUID;
    
    push_program_id UUID;
    pull_program_id UUID;
    legs_program_id UUID;
    fullbody_program_id UUID;
    
    push_workout_id UUID;
    pull_workout_id UUID;
    legs_workout_id UUID;
    fullbody_workout_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO push_cat_id FROM program_categories WHERE name = 'Push';
    SELECT id INTO pull_cat_id FROM program_categories WHERE name = 'Pull';
    SELECT id INTO legs_cat_id FROM program_categories WHERE name = 'Legs';
    SELECT id INTO fullbody_cat_id FROM program_categories WHERE name = 'Full Body';

    -- Create Push Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (push_cat_id, 'Klasik Push Programı', 'Göğüs, omuz ve triceps odaklı antrenman programı', true, 'intermediate', 3)
    RETURNING id INTO push_program_id;

    -- Create Push Workout
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (push_program_id, 'Push Day', 'Göğüs, omuz ve triceps antrenmanı', 1, 60)
    RETURNING id INTO push_workout_id;

    -- Insert Push Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (push_workout_id, 'Bench Press', 4, '8-10', 120, 'Göğüs için temel compound hareket', 1),
    (push_workout_id, 'Overhead Press', 3, '8-10', 90, 'Omuz ve triceps için etkili hareket', 2),
    (push_workout_id, 'Incline Dumbbell Press', 3, '10-12', 90, 'Üst göğüs odaklı hareket', 3),
    (push_workout_id, 'Lateral Raises', 3, '12-15', 60, 'Yan omuz izolasyon hareketi', 4),
    (push_workout_id, 'Tricep Dips', 3, '10-15', 60, 'Triceps için etkili hareket', 5),
    (push_workout_id, 'Push-ups', 3, '15-20', 45, 'Vücut ağırlığı ile göğüs çalışması', 6);

    -- Create Pull Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (pull_cat_id, 'Klasik Pull Programı', 'Sırt ve biceps odaklı antrenman programı', true, 'intermediate', 3)
    RETURNING id INTO pull_program_id;

    -- Create Pull Workout
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (pull_program_id, 'Pull Day', 'Sırt ve biceps antrenmanı', 1, 60)
    RETURNING id INTO pull_workout_id;

    -- Insert Pull Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (pull_workout_id, 'Pull-ups', 4, '6-10', 120, 'Sırt için en etkili compound hareket', 1),
    (pull_workout_id, 'Barbell Rows', 4, '8-10', 90, 'Sırt kalınlığı için temel hareket', 2),
    (pull_workout_id, 'Lat Pulldowns', 3, '10-12', 90, 'Lat kasları için izolasyon', 3),
    (pull_workout_id, 'Seated Cable Rows', 3, '10-12', 75, 'Orta sırt için etkili hareket', 4),
    (pull_workout_id, 'Bicep Curls', 3, '12-15', 60, 'Biceps için temel hareket', 5),
    (pull_workout_id, 'Face Pulls', 3, '15-20', 60, 'Rear delt ve trap çalışması', 6);

    -- Create Legs Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (legs_cat_id, 'Klasik Legs Programı', 'Alt vücut ve core odaklı antrenman programı', true, 'intermediate', 2)
    RETURNING id INTO legs_program_id;

    -- Create Legs Workout
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (legs_program_id, 'Legs Day', 'Alt vücut ve core antrenmanı', 1, 70)
    RETURNING id INTO legs_workout_id;

    -- Insert Legs Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (legs_workout_id, 'Squats', 4, '8-12', 120, 'Alt vücut için en etkili hareket', 1),
    (legs_workout_id, 'Romanian Deadlifts', 4, '8-10', 120, 'Hamstring ve glute odaklı', 2),
    (legs_workout_id, 'Bulgarian Split Squats', 3, '10-12 each leg', 90, 'Tek bacak squat varyasyonu', 3),
    (legs_workout_id, 'Walking Lunges', 3, '12-15 each leg', 75, 'Fonksiyonel bacak hareketi', 4),
    (legs_workout_id, 'Calf Raises', 4, '15-20', 45, 'Baldır kası çalışması', 5),
    (legs_workout_id, 'Plank', 3, '30-60 seconds', 60, 'Core stabilizasyon', 6);

    -- Create Full Body Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (fullbody_cat_id, 'Komple Vücut Antrenmanı', 'Tüm kas gruplarını tek seansta çalıştıran etkili program', true, 'beginner', 3)
    RETURNING id INTO fullbody_program_id;

    -- Create Full Body Workout
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (fullbody_program_id, 'Full Body Session', 'Komple vücut antrenman seansı', 1, 75)
    RETURNING id INTO fullbody_workout_id;

    -- Insert Full Body Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (fullbody_workout_id, 'Deadlifts', 4, '6-8', 120, 'Tüm vücut için compound hareket', 1),
    (fullbody_workout_id, 'Squats', 3, '8-12', 90, 'Alt vücut compound hareketi', 2),
    (fullbody_workout_id, 'Push-ups', 3, '10-15', 60, 'Üst vücut itme hareketi', 3),
    (fullbody_workout_id, 'Pull-ups', 3, '6-10', 90, 'Üst vücut çekme hareketi', 4),
    (fullbody_workout_id, 'Overhead Press', 3, '8-12', 75, 'Omuz ve core kuvveti', 5),
    (fullbody_workout_id, 'Plank', 3, '30-60 seconds', 60, 'Core stabilizasyon', 6),
    (fullbody_workout_id, 'Lunges', 3, '10-12 each leg', 60, 'Tek bacak kuvvet çalışması', 7);

END $$;
