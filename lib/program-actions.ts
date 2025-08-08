"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type ProgramCategory = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

export type WorkoutProgram = {
  id: string;
  user_id?: string;
  category_id?: string;
  name: string;
  description?: string;
  is_template: boolean;
  is_public: boolean;
  duration_weeks?: number;
  frequency_per_week?: number;
  difficulty_level?: string;
  target_goal?: string;
  equipment_type?: string;
  program_type?: string;
  created_at: string;
  updated_at: string;
  category?: ProgramCategory;
  workouts?: ProgramWorkout[];
};

export type ProgramWorkout = {
  id: string;
  program_id: string;
  name: string;
  description?: string;
  day_number: number;
  week_number?: number;
  estimated_duration_minutes?: number;
  exercises?: ProgramExercise[];
};

export type ProgramExercise = {
  id: string;
  program_workout_id: string;
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds?: number;
  description?: string;
  media_url?: string;
  order_index?: number;
};

export type CreateProgramData = {
  name: string;
  description?: string;
  category_id?: string;
  duration_weeks?: number;
  frequency_per_week?: number;
  difficulty_level?: string;
  target_goal?: string;
  equipment_type?: string;
  program_type?: string;
  workouts: {
    name: string;
    description?: string;
    day_number: number;
    week_number?: number;
    estimated_duration_minutes?: number;
    exercises: {
      exercise_name: string;
      sets: number;
      reps: string;
      rest_seconds?: number;
      description?: string;
      media_url?: string;
      order_index?: number;
    }[];
  }[];
};

// Get all program categories
export async function getProgramCategories() {
  try {
    const { data, error } = await supabase
      .from("program_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching program categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}

// Get workout programs by category or user
export async function getWorkoutPrograms(
  userId?: string,
  categoryId?: string,
  includeTemplates = true
) {
  try {
    let query = supabase
      .from("workout_programs")
      .select(
        `
        *,
        category:program_categories(*),
        workouts:program_workouts(
          *,
          exercises:program_exercises(*)
        )
      `
      )
      .order("created_at", { ascending: false });

    // Filter logic
    if (userId && includeTemplates) {
      query = query.or(`user_id.eq.${userId},is_template.eq.true`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (includeTemplates) {
      query = query.eq("is_template", true);
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching workout programs:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch programs",
    };
  }
}

// Get single program with full details
export async function getWorkoutProgram(programId: string) {
  try {
    const { data, error } = await supabase
      .from("workout_programs")
      .select(
        `
        *,
        category:program_categories(*),
        workouts:program_workouts(
          *,
          exercises:program_exercises(*)
        )
      `
      )
      .eq("id", programId)
      .single();

    if (error) throw error;

    // Sort workouts by day_number and exercises by order_index
    if (data.workouts) {
      data.workouts.sort((a: any, b: any) => a.day_number - b.day_number);
      data.workouts.forEach((workout: any) => {
        if (workout.exercises) {
          workout.exercises.sort(
            (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
          );
        }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching workout program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch program",
    };
  }
}

// Create a new workout program
export async function createWorkoutProgram(
  programData: CreateProgramData,
  userId: string
) {
  try {
    // Create the program
    const { data: program, error: programError } = await supabase
      .from("workout_programs")
      .insert({
        user_id: userId,
        category_id: programData.category_id,
        name: programData.name,
        description: programData.description,
        duration_weeks: programData.duration_weeks || 4,
        frequency_per_week: programData.frequency_per_week || 3,
        difficulty_level: programData.difficulty_level || "intermediate",
        is_template: false,
        is_public: false,
      })
      .select()
      .single();

    if (programError) throw programError;

    // Create workouts
    for (const workoutData of programData.workouts) {
      const { data: workout, error: workoutError } = await supabase
        .from("program_workouts")
        .insert({
          program_id: program.id,
          name: workoutData.name,
          description: workoutData.description,
          day_number: workoutData.day_number,
          week_number: workoutData.week_number || 1,
          estimated_duration_minutes:
            workoutData.estimated_duration_minutes || 60,
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Create exercises
      if (workoutData.exercises.length > 0) {
        const exercisesToInsert = workoutData.exercises.map(
          (exercise, index) => ({
            program_workout_id: workout.id,
            exercise_name: exercise.exercise_name,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.rest_seconds || 60,
            description: exercise.description,
            media_url: exercise.media_url,
            order_index: exercise.order_index || index + 1,
          })
        );

        const { error: exercisesError } = await supabase
          .from("program_exercises")
          .insert(exercisesToInsert);

        if (exercisesError) throw exercisesError;
      }
    }

    return { success: true, data: program };
  } catch (error) {
    console.error("Error creating workout program:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create program",
    };
  }
}

// Copy a template program to user's programs
export async function copyTemplateProgram(
  templateId: string,
  userId: string,
  customName?: string
) {
  try {
    // Get the template program
    const templateResult = await getWorkoutProgram(templateId);
    if (!templateResult.success || !templateResult.data) {
      throw new Error("Template not found");
    }

    const template = templateResult.data;

    // Create program data from template
    const programData: CreateProgramData = {
      name: customName || `My ${template.name}`,
      description: template.description,
      category_id: template.category_id,
      duration_weeks: template.duration_weeks,
      frequency_per_week: template.frequency_per_week,
      difficulty_level: template.difficulty_level,
      workouts:
        template.workouts?.map((workout: any) => ({
          name: workout.name,
          description: workout.description,
          day_number: workout.day_number,
          week_number: workout.week_number,
          estimated_duration_minutes: workout.estimated_duration_minutes,
          exercises:
            workout.exercises?.map((exercise: any) => ({
              exercise_name: exercise.exercise_name,
              sets: exercise.sets,
              reps: exercise.reps,
              rest_seconds: exercise.rest_seconds,
              description: exercise.description,
              media_url: exercise.media_url,
              order_index: exercise.order_index,
            })) || [],
        })) || [],
    };

    return await createWorkoutProgram(programData, userId);
  } catch (error) {
    console.error("Error copying template program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to copy template",
    };
  }
}

// Delete a user's workout program
export async function deleteWorkoutProgram(programId: string, userId: string) {
  try {
    const { error } = await supabase
      .from("workout_programs")
      .delete()
      .eq("id", programId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting workout program:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete program",
    };
  }
}

// Get program workout by ID (for workout execution)
export async function getProgramWorkout(workoutId: string) {
  try {
    const { data, error } = await supabase
      .from("program_workouts")
      .select(
        `
        *,
        program:workout_programs(*),
        exercises:program_exercises(*)
      `
      )
      .eq("id", workoutId)
      .single();

    if (error) throw error;

    // Sort exercises by order_index
    if (data.exercises) {
      data.exercises.sort(
        (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
      );
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching program workout:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch workout",
    };
  }
}

// Filtered program search with new category system
export async function getFilteredPrograms(filters: {
  userId?: string;
  categoryId?: string;
  targetGoal?: string;
  difficultyLevel?: string;
  equipmentType?: string;
  programType?: string;
  includeTemplates?: boolean;
}) {
  try {
    let query = supabase
      .from("workout_programs")
      .select(
        `
        *,
        category:program_categories(*),
        workouts:program_workouts(
          *,
          exercises:program_exercises(*)
        )
      `
      )
      .order("created_at", { ascending: false });

    // User filter
    if (filters.userId && filters.includeTemplates !== false) {
      query = query.or(`user_id.eq.${filters.userId},is_template.eq.true`);
    } else if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    } else if (filters.includeTemplates !== false) {
      query = query.eq("is_template", true);
    }

    // Category filter
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    // Target goal filter
    if (filters.targetGoal) {
      query = query.eq("target_goal", filters.targetGoal);
    }

    // Difficulty filter
    if (filters.difficultyLevel) {
      query = query.eq("difficulty_level", filters.difficultyLevel);
    }

    // Equipment filter
    if (filters.equipmentType) {
      query = query.eq("equipment_type", filters.equipmentType);
    }

    // Program type filter
    if (filters.programType) {
      query = query.eq("program_type", filters.programType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching filtered programs:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch programs",
    };
  }
}

// Get programs grouped by category with new system
export async function getProgramsByCategory(userId?: string) {
  try {
    const categoriesResult = await getProgramCategories();
    if (!categoriesResult.success) {
      throw new Error("Failed to fetch categories");
    }

    const categories = categoriesResult.data || [];
    const programsByCategory = [];

    for (const category of categories) {
      const programsResult = await getFilteredPrograms({
        userId,
        categoryId: category.id,
        includeTemplates: true,
      });

      if (programsResult.success) {
        programsByCategory.push({
          ...category,
          programs: programsResult.data || [],
        });
      }
    }

    return { success: true, data: programsByCategory };
  } catch (error) {
    console.error("Error fetching programs by category:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch programs by category",
    };
  }
}
