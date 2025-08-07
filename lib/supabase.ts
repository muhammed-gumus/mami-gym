import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Workout = {
  id: string
  user_id: string
  title: string
  workout_type: string
  completed_at: string
  notes?: string
  duration_minutes?: number
}

export type WorkoutExercise = {
  id: string
  workout_id: string
  exercise_name: string
  sets: number
  reps: string
  description?: string
  media_url?: string
  completed_sets: number
}

export type WorkoutWithExercises = Workout & {
  workout_exercises: WorkoutExercise[]
}

export type UserProfile = {
  id: string
  user_id: string
  height_cm?: number
  weight_kg?: number
  age?: number
  gender?: string
  body_fat_percentage?: number
  muscle_mass_kg?: number
  chest_cm?: number
  waist_cm?: number
  bicep_cm?: number
  thigh_cm?: number
  notes?: string
  updated_at: string
}
