-- Insert default workout program templates

-- Get category IDs
DO $$
DECLARE
    ppl_cat_id UUID;
    fullbody_cat_id UUID;
    split_cat_id UUID;
    ppl_program_id UUID;
    fullbody_program_id UUID;
    split_program_id UUID;
    ppl_push_workout_id UUID;
    ppl_pull_workout_id UUID;
    ppl_legs_workout_id UUID;
    fullbody_workout_id UUID;
    split_chest_workout_id UUID;
    split_back_workout_id UUID;
    split_legs_workout_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO ppl_cat_id FROM program_categories WHERE name = 'PPL';
    SELECT id INTO fullbody_cat_id FROM program_categories WHERE name = 'Full Body';
    SELECT id INTO split_cat_id FROM program_categories WHERE name = 'Split';

    -- Create PPL Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (ppl_cat_id, 'Klasik PPL Programı', '3 günlük Push-Pull-Legs döngüsü ile etkili antrenman', true, 'intermediate', 3)
    RETURNING id INTO ppl_program_id;

    -- Create PPL Push Workout (Day 1)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (ppl_program_id, 'Push Day', 'Göğüs, omuz ve triceps antrenmanı', 1, 60)
    RETURNING id INTO ppl_push_workout_id;

    -- Insert PPL Push Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (ppl_push_workout_id, 'Bench Press', 4, '8-10', 120, 'Göğüs için temel compound hareket', 1),
    (ppl_push_workout_id, 'Overhead Press', 3, '8-10', 90, 'Omuz ve triceps için etkili hareket', 2),
    (ppl_push_workout_id, 'Incline Dumbbell Press', 3, '10-12', 90, 'Üst göğüs odaklı hareket', 3),
    (ppl_push_workout_id, 'Lateral Raises', 3, '12-15', 60, 'Yan omuz izolasyon hareketi', 4),
    (ppl_push_workout_id, 'Tricep Dips', 3, '10-15', 60, 'Triceps için etkili hareket', 5),
    (ppl_push_workout_id, 'Push-ups', 3, '15-20', 45, 'Vücut ağırlığı ile göğüs çalışması', 6);

    -- Create PPL Pull Workout (Day 2)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (ppl_program_id, 'Pull Day', 'Sırt ve biceps antrenmanı', 2, 60)
    RETURNING id INTO ppl_pull_workout_id;

    -- Insert PPL Pull Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (ppl_pull_workout_id, 'Pull-ups', 4, '6-10', 120, 'Sırt için en etkili compound hareket', 1),
    (ppl_pull_workout_id, 'Barbell Rows', 4, '8-10', 90, 'Sırt kalınlığı için temel hareket', 2),
    (ppl_pull_workout_id, 'Lat Pulldowns', 3, '10-12', 90, 'Lat kasları için izolasyon', 3),
    (ppl_pull_workout_id, 'Cable Rows', 3, '10-12', 75, 'Orta sırt için etkili hareket', 4),
    (ppl_pull_workout_id, 'Bicep Curls', 3, '12-15', 60, 'Biceps için temel hareket', 5),
    (ppl_pull_workout_id, 'Hammer Curls', 3, '12-15', 60, 'Biceps ve ön kol için', 6);

    -- Create PPL Legs Workout (Day 3)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (ppl_program_id, 'Legs Day', 'Alt vücut ve core antrenmanı', 3, 70)
    RETURNING id INTO ppl_legs_workout_id;

    -- Insert PPL Legs Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (ppl_legs_workout_id, 'Squats', 4, '8-12', 120, 'Alt vücut için en etkili hareket', 1),
    (ppl_legs_workout_id, 'Romanian Deadlifts', 4, '8-10', 120, 'Hamstring ve glute odaklı', 2),
    (ppl_legs_workout_id, 'Bulgarian Split Squats', 3, '10-12 each leg', 90, 'Tek bacak squat varyasyonu', 3),
    (ppl_legs_workout_id, 'Walking Lunges', 3, '12-15 each leg', 75, 'Fonksiyonel bacak hareketi', 4),
    (ppl_legs_workout_id, 'Calf Raises', 4, '15-20', 45, 'Baldır kası çalışması', 5),
    (ppl_legs_workout_id, 'Plank', 3, '30-60 seconds', 60, 'Core stabilizasyon', 6);

    -- Create Full Body Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (fullbody_cat_id, 'Komple Vücut Antrenmanı', 'Tüm kas gruplarını tek seansta çalıştıran etkili program', true, 'intermediate', 3)
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

    -- Create Split Program Template
    INSERT INTO workout_programs (category_id, name, description, is_template, difficulty_level, frequency_per_week)
    VALUES (split_cat_id, 'Klasik Split Programı', 'Kas gruplarına göre ayrılmış haftalık antrenman programı', true, 'intermediate', 4)
    RETURNING id INTO split_program_id;

    -- Create Split Chest & Triceps Workout (Day 1)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (split_program_id, 'Chest & Triceps', 'Göğüs ve triceps odaklı antrenman', 1, 60)
    RETURNING id INTO split_chest_workout_id;

    -- Insert Split Chest Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (split_chest_workout_id, 'Bench Press', 4, '8-10', 120, 'Göğüs için temel hareket', 1),
    (split_chest_workout_id, 'Incline Dumbbell Press', 3, '10-12', 90, 'Üst göğüs çalışması', 2),
    (split_chest_workout_id, 'Dumbbell Flyes', 3, '12-15', 75, 'Göğüs izolasyon hareketi', 3),
    (split_chest_workout_id, 'Tricep Dips', 3, '10-15', 60, 'Triceps compound hareketi', 4),
    (split_chest_workout_id, 'Tricep Extensions', 3, '12-15', 60, 'Triceps izolasyon', 5);

    -- Create Split Back & Biceps Workout (Day 3)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (split_program_id, 'Back & Biceps', 'Sırt ve biceps odaklı antrenman', 3, 60)
    RETURNING id INTO split_back_workout_id;

    -- Insert Split Back Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (split_back_workout_id, 'Pull-ups', 4, '6-10', 120, 'Sırt için en etkili hareket', 1),
    (split_back_workout_id, 'Barbell Rows', 4, '8-10', 90, 'Sırt kalınlığı çalışması', 2),
    (split_back_workout_id, 'Lat Pulldowns', 3, '10-12', 90, 'Lat genişliği için', 3),
    (split_back_workout_id, 'Bicep Curls', 3, '12-15', 60, 'Biceps için temel hareket', 4),
    (split_back_workout_id, 'Hammer Curls', 3, '12-15', 60, 'Biceps ve ön kol', 5);

    -- Create Split Legs & Shoulders Workout (Day 5)
    INSERT INTO program_workouts (program_id, name, description, day_number, estimated_duration_minutes)
    VALUES (split_program_id, 'Legs & Shoulders', 'Bacak ve omuz antrenmanı', 5, 70)
    RETURNING id INTO split_legs_workout_id;

    -- Insert Split Legs Exercises
    INSERT INTO program_exercises (program_workout_id, exercise_name, sets, reps, rest_seconds, description, order_index) VALUES
    (split_legs_workout_id, 'Squats', 4, '8-12', 120, 'Temel bacak hareketi', 1),
    (split_legs_workout_id, 'Romanian Deadlifts', 4, '8-10', 120, 'Hamstring çalışması', 2),
    (split_legs_workout_id, 'Leg Press', 3, '12-15', 90, 'Quadriceps izolasyon', 3),
    (split_legs_workout_id, 'Overhead Press', 4, '8-10', 90, 'Omuz compound hareketi', 4),
    (split_legs_workout_id, 'Lateral Raises', 3, '12-15', 60, 'Yan omuz izolasyon', 5),
    (split_legs_workout_id, 'Calf Raises', 4, '15-20', 45, 'Baldır çalışması', 6);

END $$;
