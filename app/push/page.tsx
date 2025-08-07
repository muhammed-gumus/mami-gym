'use client'

import { useState } from 'react'
import WorkoutPage from '@/components/workout-page'

const pushExercises = [
  {
    id: 1,
    name: 'Bench Press',
    sets: 4,
    reps: '8-10',
    description: 'Lie on bench, lower bar to chest, press up with control',
    media: '/placeholder.svg?height=200&width=300&text=Bench+Press'
  },
  {
    id: 2,
    name: 'Overhead Press',
    sets: 3,
    reps: '8-10',
    description: 'Press barbell overhead from shoulder height, keep core tight',
    media: '/placeholder.svg?height=200&width=300&text=Overhead+Press'
  },
  {
    id: 3,
    name: 'Incline Dumbbell Press',
    sets: 3,
    reps: '10-12',
    description: 'Press dumbbells on incline bench, focus on upper chest',
    media: '/placeholder.svg?height=200&width=300&text=Incline+Press'
  },
  {
    id: 4,
    name: 'Lateral Raises',
    sets: 3,
    reps: '12-15',
    description: 'Raise dumbbells to sides until parallel with floor',
    media: '/placeholder.svg?height=200&width=300&text=Lateral+Raises'
  },
  {
    id: 5,
    name: 'Tricep Dips',
    sets: 3,
    reps: '10-15',
    description: 'Lower body by bending arms, push back up',
    media: '/placeholder.svg?height=200&width=300&text=Tricep+Dips'
  },
  {
    id: 6,
    name: 'Push-ups',
    sets: 3,
    reps: '15-20',
    description: 'Classic push-up with proper form and full range of motion',
    media: '/placeholder.svg?height=200&width=300&text=Push+Ups'
  }
]

export default function PushPage() {
  return <WorkoutPage title="PUSH WORKOUT" exercises={pushExercises} />
}
