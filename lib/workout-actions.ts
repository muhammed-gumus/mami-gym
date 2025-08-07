'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for server actions
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export type WorkoutData = {
  title: string
  workout_type: string
  notes?: string
  duration_minutes?: number
  exercises: Array<{
    exercise_name: string
    sets: number
    reps: string
    description?: string
    media_url?: string
    completed_sets: number
  }>
}

export async function saveWorkout(workoutData: WorkoutData, userId: string) {
  try {
    console.log('Saving workout for user:', userId)
    console.log('Workout data:', workoutData)

    // First, let's check if the user_id column exists by trying a simple query
    const { data: testData, error: testError } = await supabase
      .from('workouts')
      .select('id, user_id')
      .limit(1)

    console.log('Schema test result:', { testData, testError })

    // If user_id column doesn't exist, create workout without it
    let workoutInsertData: any = {
      title: workoutData.title,
      workout_type: workoutData.workout_type,
      notes: workoutData.notes || null,
      duration_minutes: workoutData.duration_minutes || null,
      completed_at: new Date().toISOString()
    }

    // Only add user_id if the column exists (no error from test query)
    if (!testError || !testError.message.includes('user_id')) {
      workoutInsertData.user_id = userId
    }

    console.log('Insert data:', workoutInsertData)

    // Insert workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert(workoutInsertData)
      .select()
      .single()

    if (workoutError) {
      console.error('Workout insert error:', workoutError)
      throw workoutError
    }

    console.log('Workout inserted:', workout)

    // Insert exercises
    if (workoutData.exercises && workoutData.exercises.length > 0) {
      const exercisesToInsert = workoutData.exercises.map(exercise => ({
        workout_id: workout.id,
        exercise_name: exercise.exercise_name,
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.description || null,
        media_url: exercise.media_url || null,
        completed_sets: exercise.completed_sets
      }))

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert)

      if (exercisesError) {
        console.error('Exercises insert error:', exercisesError)
        throw exercisesError
      }

      console.log('Exercises inserted successfully')
    }

    return { success: true, workout }
  } catch (error) {
    console.error('Error saving workout:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save workout' 
    }
  }
}

export async function getWorkoutHistory(userId: string) {
  try {
    console.log('Fetching workout history for user:', userId)

    // Test if user_id column exists
    const { data: testData, error: testError } = await supabase
      .from('workouts')
      .select('id, user_id')
      .limit(1)

    let query = supabase
      .from('workouts')
      .select(`
        id,
        title,
        workout_type,
        completed_at,
        notes,
        duration_minutes,
        workout_exercises (
          id,
          exercise_name,
          sets,
          reps,
          description,
          media_url,
          completed_sets
        )
      `)
      .order('completed_at', { ascending: false })

    // Only filter by user_id if the column exists
    if (!testError || !testError.message.includes('user_id')) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching workout history:', error)
      throw error
    }

    console.log('Workout history fetched:', data?.length || 0, 'workouts')
    return { success: true, workouts: data || [] }
  } catch (error) {
    console.error('Error fetching workout history:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch workout history' 
    }
  }
}

export async function deleteWorkout(workoutId: string, userId: string) {
  try {
    console.log('Deleting workout:', workoutId, 'for user:', userId)

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting workout:', error)
      throw error
    }

    console.log('Workout deleted successfully')
    return { success: true }
  } catch (error) {
    console.error('Error deleting workout:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete workout' 
    }
  }
}

export async function getUserProfile(userId: string) {
  try {
    console.log('Fetching profile for user:', userId)

    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error)
      throw error
    }

    console.log('Profile fetched:', data ? 'found' : 'not found')
    return { success: true, profile: data }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch profile' 
    }
  }
}

export async function saveUserProfile(profileData: any, userId: string) {
  try {
    console.log('Saving profile for user:', userId)

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profile')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    let result
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('user_profile')
        .update({
          height_cm: profileData.height_cm || null,
          weight_kg: profileData.weight_kg || null,
          age: profileData.age || null,
          gender: profileData.gender || null,
          body_fat_percentage: profileData.body_fat_percentage || null,
          muscle_mass_kg: profileData.muscle_mass_kg || null,
          chest_cm: profileData.chest_cm || null,
          waist_cm: profileData.waist_cm || null,
          bicep_cm: profileData.bicep_cm || null,
          thigh_cm: profileData.thigh_cm || null,
          notes: profileData.notes || null
        })
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('user_profile')
        .insert({
          user_id: userId,
          height_cm: profileData.height_cm || null,
          weight_kg: profileData.weight_kg || null,
          age: profileData.age || null,
          gender: profileData.gender || null,
          body_fat_percentage: profileData.body_fat_percentage || null,
          muscle_mass_kg: profileData.muscle_mass_kg || null,
          chest_cm: profileData.chest_cm || null,
          waist_cm: profileData.waist_cm || null,
          bicep_cm: profileData.bicep_cm || null,
          thigh_cm: profileData.thigh_cm || null,
          notes: profileData.notes || null
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving profile:', result.error)
      throw result.error
    }

    console.log('Profile saved successfully')
    return { success: true, profile: result.data }
  } catch (error) {
    console.error('Error saving profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save profile' 
    }
  }
}
