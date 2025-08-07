'use client'

import { useState } from 'react'
import { ArrowLeft, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import ExerciseCard from './exercise-card'
import { saveWorkout } from '@/lib/workout-actions'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  description: string
  media?: string
}

interface WorkoutPageProps {
  title: string
  exercises: Exercise[]
}

export default function WorkoutPage({ title, exercises }: WorkoutPageProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({})
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false)
  const [notes, setNotes] = useState('')
  const [exerciseList, setExerciseList] = useState(exercises)
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: '8-10',
    description: '',
    media: ''
  })
  const [workoutStartTime] = useState(new Date())

  if (!user) {
    router.push('/auth')
    return null
  }

  const toggleSet = (exerciseId: number, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const updateExercise = (exerciseId: number, updates: Partial<Exercise>) => {
    setExerciseList(prev => prev.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    ))
  }

  const addExercise = () => {
    if (newExercise.name.trim()) {
      const exercise = {
        id: Math.max(...exerciseList.map(e => e.id), 0) + 1,
        ...newExercise
      }
      setExerciseList(prev => [...prev, exercise])
      setNewExercise({
        name: '',
        sets: 3,
        reps: '8-10',
        description: '',
        media: ''
      })
      setIsAddingExercise(false)
    }
  }

  const deleteExercise = (exerciseId: number) => {
    setExerciseList(prev => prev.filter(ex => ex.id !== exerciseId))
    setCompletedSets(prev => {
      const newCompletedSets = { ...prev }
      Object.keys(newCompletedSets).forEach(key => {
        if (key.startsWith(`${exerciseId}-`)) {
          delete newCompletedSets[key]
        }
      })
      return newCompletedSets
    })
  }

  const handleWorkoutComplete = async () => {
    if (isSaving) return
    
    if (!isWorkoutCompleted) {
      setIsSaving(true)
      
      try {
        const duration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60))
        
        const exercisesWithCompletedSets = exerciseList.map(exercise => {
          const completedCount = Array.from({ length: exercise.sets }, (_, i) => {
            const key = `${exercise.id}-${i}`
            return completedSets[key] ? 1 : 0
          }).reduce((sum, val) => sum + val, 0)

          return {
            exercise_name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            description: exercise.description,
            media_url: exercise.media,
            completed_sets: completedCount
          }
        })

        const result = await saveWorkout({
          title: title,
          workout_type: title.toLowerCase().replace(/\s+/g, '-').replace('&', ''),
          notes: notes || undefined,
          duration_minutes: duration,
          exercises: exercisesWithCompletedSets
        }, user.id)

        if (result.success) {
          setIsWorkoutCompleted(true)
          alert('İdman başarıyla kaydedildi!')
          setTimeout(() => {
            router.push('/history')
          }, 1500)
        } else {
          // If database save fails, show error but allow user to continue
          console.error('Database save failed:', result.error)
          
          if (result.error?.includes('user_id') || result.error?.includes('schema')) {
            alert('Veritabanı henüz kurulmamış. Lütfen SQL scriptini çalıştırın: scripts/simple-database-setup.sql')
          } else {
            alert('İdman kaydedilirken hata oluştu: ' + result.error)
          }
          
          // Still mark as completed for user experience
          setIsWorkoutCompleted(true)
        }
      } catch (error) {
        console.error('Error saving workout:', error)
        alert('İdman kaydedilirken hata oluştu. Veritabanı bağlantısını kontrol edin.')
        
        // Still mark as completed for user experience
        setIsWorkoutCompleted(true)
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
        </div>

        {/* Workout Summary */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">WORKOUT SUMMARY</h2>
          <div className="space-y-2 text-sm md:text-base">
            <p><strong>Warm-up:</strong> 5-10 minutes light cardio and dynamic stretching</p>
            <p><strong>Rest interval:</strong> 60-90 seconds between sets</p>
            <p><strong>Tip:</strong> Increase weights weekly if form is good</p>
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4 mb-8">
          {exerciseList.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completedSets={completedSets}
              onToggleSet={toggleSet}
              onUpdateExercise={updateExercise}
              onDeleteExercise={deleteExercise}
            />
          ))}
        </div>

        {/* Add Exercise Section */}
        <div className="border-2 border-black p-6 mb-8">
          {!isAddingExercise ? (
            <Button
              onClick={() => setIsAddingExercise(true)}
              className="w-full bg-white text-black border-2 border-black hover:bg-black hover:text-white"
            >
              + ADD NEW EXERCISE
            </Button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">ADD NEW EXERCISE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Exercise Name</label>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Enter exercise name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Sets</label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Reps</label>
                  <input
                    type="text"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="e.g., 8-10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Media URL (Optional)</label>
                  <input
                    type="url"
                    value={newExercise.media}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, media: e.target.value }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Image or video URL"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea
                  value={newExercise.description}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black h-20 resize-none"
                  placeholder="Exercise description and form tips"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addExercise} className="bg-black text-white hover:bg-gray-800">
                  Add Exercise
                </Button>
                <Button 
                  onClick={() => setIsAddingExercise(false)} 
                  variant="outline" 
                  className="border-black"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="border-2 border-black p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">NOTES</h2>
            <Edit2 className="w-5 h-5" />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your workout notes here..."
            className="w-full h-24 p-3 border border-gray-300 resize-none focus:outline-none focus:border-black"
          />
        </div>

        {/* Workout Completed Button */}
        <Button
          onClick={handleWorkoutComplete}
          disabled={isSaving}
          className={`w-full py-4 text-lg font-bold transition-all duration-300 ${
            isWorkoutCompleted
              ? 'bg-green-600 text-white'
              : isSaving
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-white text-black border-2 border-black hover:bg-black hover:text-white'
          }`}
        >
          {isSaving ? 'KAYDEDİLİYOR...' : isWorkoutCompleted ? '✓ WORKOUT COMPLETED' : 'MARK AS COMPLETED'}
        </Button>
      </div>
    </div>
  )
}
