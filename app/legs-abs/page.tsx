'use client'

import WorkoutPage from '@/components/workout-page'

const legsAbsExercises = [
  {
    id: 1,
    name: 'Squats',
    sets: 4,
    reps: '10-12',
    description: 'Lower body until thighs parallel, drive through heels',
    media: '/placeholder.svg?height=200&width=300&text=Squats'
  },
  {
    id: 2,
    name: 'Romanian Deadlifts',
    sets: 4,
    reps: '8-10',
    description: 'Hinge at hips, lower bar while keeping back straight',
    media: '/placeholder.svg?height=200&width=300&text=Romanian+Deadlifts'
  },
  {
    id: 3,
    name: 'Bulgarian Split Squats',
    sets: 3,
    reps: '10-12 each leg',
    description: 'Rear foot elevated, lower into lunge position',
    media: '/placeholder.svg?height=200&width=300&text=Bulgarian+Split+Squats'
  },
  {
    id: 4,
    name: 'Leg Press',
    sets: 3,
    reps: '12-15',
    description: 'Press weight with legs, full range of motion',
    media: '/placeholder.svg?height=200&width=300&text=Leg+Press'
  },
  {
    id: 5,
    name: 'Plank',
    sets: 3,
    reps: '30-60 seconds',
    description: 'Hold plank position, keep core tight and body straight',
    media: '/placeholder.svg?height=200&width=300&text=Plank'
  },
  {
    id: 6,
    name: 'Russian Twists',
    sets: 3,
    reps: '20-30',
    description: 'Sit with feet elevated, rotate torso side to side',
    media: '/placeholder.svg?height=200&width=300&text=Russian+Twists'
  }
]

export default function LegsAbsPage() {
  return <WorkoutPage title="LEGS & ABS WORKOUT" exercises={legsAbsExercises} />
}
