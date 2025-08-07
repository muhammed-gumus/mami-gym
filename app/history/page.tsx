'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, Trash2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getWorkoutHistory, deleteWorkout } from '@/lib/workout-actions'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

type WorkoutExercise = {
  id: string
  exercise_name: string
  sets: number
  reps: string
  description?: string
  media_url?: string
  completed_sets: number
}

type Workout = {
  id: string
  title: string
  workout_type: string
  completed_at: string
  notes?: string
  duration_minutes?: number
  workout_exercises: WorkoutExercise[]
}

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    loadWorkouts()
  }, [user, router])

  const loadWorkouts = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    
    try {
      if (!user) return
    
      const result = await getWorkoutHistory(user.id)
      if (result.success) {
        setWorkouts(result.workouts || [])
        console.log('Loaded workouts:', result.workouts?.length || 0)
      } else {
        setError(result.error || 'Failed to load workouts')
        console.error('Failed to load workouts:', result.error)
      
        // Show specific message for schema errors
        if (result.error?.includes('user_id') || result.error?.includes('schema')) {
          setError('Veritabanı tabloları bulunamadı. Lütfen SQL scriptini çalıştırın: scripts/simple-database-setup.sql')
        }
      }
    } catch (err) {
      console.error('Error loading workouts:', err)
      setError('Veritabanı bağlantısı kurulamadı')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!user) return
    
    if (confirm('Bu idmanı silmek istediğinizden emin misiniz?')) {
      try {
        const result = await deleteWorkout(workoutId, user.id)
        if (result.success) {
          setWorkouts(prev => prev.filter(w => w.id !== workoutId))
          alert('İdman başarıyla silindi!')
        } else {
          alert('İdman silinemedi: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting workout:', error)
        alert('İdman silinemedi.')
      }
    }
  }

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId)
      } else {
        newSet.add(workoutId)
      }
      return newSet
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getWorkoutTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'push': 'PUSH',
      'pull': 'PULL',
      'legs-abs': 'LEGS & ABS',
      'cardio': 'CARDIO'
    }
    return labels[type] || type.toUpperCase()
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-xl">Veriler yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold">İDMAN GEÇMİŞİ</h1>
          </div>
          <Button
            onClick={() => loadWorkouts(true)}
            disabled={refreshing}
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="border-2 border-red-300 bg-red-50 p-4">
              <div className="text-red-600">
                <p className="font-semibold">Hata</p>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={() => loadWorkouts()} 
                  className="mt-2 bg-red-600 text-white hover:bg-red-700"
                  size="sm"
                >
                  Tekrar Dene
                </Button>
              </div>
            </div>
          </div>
        )}

        {workouts.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-xl font-bold mb-2">Henüz tamamlanmış idman yok</h2>
            <p className="text-gray-600 mb-6">İlk idmanınızı tamamlayın ve burada görün!</p>
            <Link href="/">
              <Button className="bg-black text-white hover:bg-gray-800">
                İdmana Başla
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Toplam {workouts.length} idman bulundu
            </div>
            
            {workouts.map((workout) => {
              const isExpanded = expandedWorkouts.has(workout.id)
              const exercises = workout.workout_exercises || []
              const totalExercises = exercises.length
              const completedSets = exercises.reduce((sum, ex) => sum + (ex.completed_sets || 0), 0)
              const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)

              return (
                <div key={workout.id} className="border-2 border-black">
                  {/* Workout Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleWorkoutExpansion(workout.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg md:text-xl font-bold">
                            {getWorkoutTypeLabel(workout.workout_type)}
                          </h3>
                          <span className="px-2 py-1 bg-black text-white text-xs font-bold">
                            {totalExercises} HAREKET
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(workout.completed_at)}
                          </div>
                          {workout.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {workout.duration_minutes} dk
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm">
                            <span className="font-semibold">{completedSets}/{totalSets}</span> set tamamlandı
                          </div>
                          <div className="w-full bg-gray-200 h-2 mt-1">
                            <div 
                              className="bg-black h-2 transition-all duration-300"
                              style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteWorkout(workout.id)
                          }}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t-2 border-black p-4">
                      {/* Notes */}
                      {workout.notes && (
                        <div className="mb-4">
                          <h4 className="font-bold mb-2">NOTLAR:</h4>
                          <p className="text-sm bg-gray-50 p-3 border">{workout.notes}</p>
                        </div>
                      )}

                      {/* Exercises */}
                      <div>
                        <h4 className="font-bold mb-3">HAREKETLER:</h4>
                        <div className="space-y-3">
                          {exercises.map((exercise, index) => (
                            <div key={exercise.id || index} className="border border-gray-300 p-3">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-semibold">{exercise.exercise_name}</h5>
                                <span className="text-sm text-gray-600">
                                  {exercise.completed_sets || 0}/{exercise.sets} set
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {exercise.sets} set × {exercise.reps} tekrar
                              </p>
                              {exercise.description && (
                                <p className="text-sm text-gray-500">{exercise.description}</p>
                              )}
                              <div className="w-full bg-gray-200 h-1 mt-2">
                                <div 
                                  className="bg-black h-1 transition-all duration-300"
                                  style={{ width: `${exercise.sets > 0 ? ((exercise.completed_sets || 0) / exercise.sets) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
