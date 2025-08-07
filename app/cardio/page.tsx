'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, RotateCcw, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { saveWorkout } from '@/lib/workout-actions'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

export default function CardioPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<'incline' | 'hiit' | null>(null)
  const [duration, setDuration] = useState(30)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [isHiitRun, setIsHiitRun] = useState(true)
  const [workoutStartTime] = useState(new Date())

  if (!user) {
    router.push('/auth')
    return null
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false)
            if (selectedOption === 'hiit') {
              setIsHiitRun(!isHiitRun)
              return 60
            }
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, selectedOption, isHiitRun])

  const startTimer = () => {
    if (timeLeft === 0) {
      if (selectedOption === 'incline') {
        setTimeLeft(duration * 60)
      } else if (selectedOption === 'hiit') {
        setTimeLeft(60)
      }
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(0)
    setIsHiitRun(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleWorkoutComplete = async () => {
    if (isSaving) return
    
    if (!isWorkoutCompleted) {
      setIsSaving(true)
      
      try {
        const workoutDuration = Math.round((new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60))
        
        const exerciseData = {
          exercise_name: selectedOption === 'incline' ? 'Incline Walking' : 'HIIT Training',
          sets: 1,
          reps: `${duration} minutes`,
          description: selectedOption === 'incline' 
            ? `Incline walking for ${duration} minutes`
            : `HIIT training: 1 min run / 1 min walk for ${duration} minutes`,
          media_url: undefined,
          completed_sets: 1
        }

        const result = await saveWorkout({
          title: 'CARDIO WORKOUT',
          workout_type: 'cardio',
          notes: notes || undefined,
          duration_minutes: workoutDuration,
          exercises: [exerciseData]
        }, user.id)

        if (result.success) {
          setIsWorkoutCompleted(true)
          alert('Cardio idmanı başarıyla kaydedildi!')
          setTimeout(() => {
            router.push('/history')
          }, 1500)
        } else {
          alert('İdman kaydedilirken hata oluştu: ' + result.error)
        }
      } catch (error) {
        console.error('Error saving workout:', error)
        alert('İdman kaydedilirken hata oluştu.')
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (!selectedOption) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/" className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">CARDIO WORKOUT</h1>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-black p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">WORKOUT SUMMARY</h2>
              <div className="space-y-2 text-sm md:text-base">
                <p><strong>Warm-up:</strong> 5-10 minutes light movement</p>
                <p><strong>Choose your cardio type:</strong> Incline walking or HIIT</p>
                <p><strong>Cool-down:</strong> 5 minutes walking and stretching</p>
                <p><strong>Tip:</strong> Stay hydrated and listen to your body</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <button
                onClick={() => setSelectedOption('incline')}
                className="border-2 border-black p-8 text-center hover:bg-black hover:text-white transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-2">INCLINE WALKING</h3>
                <p className="text-sm">30-45 minutes</p>
                <p className="text-sm mt-2">Steady-state cardio</p>
              </button>

              <button
                onClick={() => setSelectedOption('hiit')}
                className="border-2 border-black p-8 text-center hover:bg-black hover:text-white transition-all duration-300"
              >
                <h3 className="text-xl font-bold mb-2">HIIT TRAINING</h3>
                <p className="text-sm">20-25 minutes</p>
                <p className="text-sm mt-2">1 min run / 1 min walk</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <button onClick={() => setSelectedOption(null)} className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {selectedOption === 'incline' ? 'INCLINE WALKING' : 'HIIT TRAINING'}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Duration Selection */}
          <div className="border-2 border-black p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">DURATION</h2>
            <div className="flex flex-wrap gap-2">
              {selectedOption === 'incline' ? (
                [30, 35, 40, 45].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`px-4 py-2 border border-black ${
                      duration === min ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {min} min
                  </button>
                ))
              ) : (
                [20, 22, 25].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDuration(min)}
                    className={`px-4 py-2 border border-black ${
                      duration === min ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {min} min
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="border-2 border-black p-8 mb-6 text-center">
            <div className="text-6xl md:text-8xl font-bold mb-4">
              {formatTime(timeLeft)}
            </div>
            {selectedOption === 'hiit' && timeLeft > 0 && (
              <div className="text-2xl font-bold mb-4">
                {isHiitRun ? 'RUN' : 'WALK'}
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="border-black text-black hover:bg-gray-100"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-2 border-black p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">INSTRUCTIONS</h2>
            {selectedOption === 'incline' ? (
              <div className="space-y-2 text-sm md:text-base">
                <p>• Set treadmill to 3-6% incline</p>
                <p>• Walk at moderate pace (3.5-4.5 mph)</p>
                <p>• Maintain steady breathing</p>
                <p>• Keep good posture throughout</p>
              </div>
            ) : (
              <div className="space-y-2 text-sm md:text-base">
                <p>• Run: 80-90% effort for 1 minute</p>
                <p>• Walk: Recovery pace for 1 minute</p>
                <p>• Repeat for {duration} minutes total</p>
                <p>• Focus on form over speed</p>
              </div>
            )}
          </div>

          {/* Notes */}
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
    </div>
  )
}
