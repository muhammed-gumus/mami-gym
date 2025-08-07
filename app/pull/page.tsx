'use client'

import WorkoutPage from '@/components/workout-page'

const pullExercises = [
  {
    id: 1,
    name: 'Pull-ups',
    sets: 4,
    reps: '6-10',
    description: 'Hang from bar, pull body up until chin over bar',
    media: '/placeholder.svg?height=200&width=300&text=Pull+Ups'
  },
  {
    id: 2,
    name: 'Barbell Rows',
    sets: 4,
    reps: '8-10',
    description: 'Bend over, pull barbell to lower chest, squeeze shoulder blades',
    media: '/placeholder.svg?height=200&width=300&text=Barbell+Rows'
  },
  {
    id: 3,
    name: 'Lat Pulldowns',
    sets: 3,
    reps: '10-12',
    description: 'Pull bar down to upper chest, focus on lat engagement',
    media: '/placeholder.svg?height=200&width=300&text=Lat+Pulldowns'
  },
  {
    id: 4,
    name: 'Seated Cable Rows',
    sets: 3,
    reps: '10-12',
    description: 'Pull cable to torso, squeeze shoulder blades together',
    media: '/placeholder.svg?height=200&width=300&text=Cable+Rows'
  },
  {
    id: 5,
    name: 'Bicep Curls',
    sets: 3,
    reps: '12-15',
    description: 'Curl dumbbells up, control the negative movement',
    media: '/placeholder.svg?height=200&width=300&text=Bicep+Curls'
  },
  {
    id: 6,
    name: 'Face Pulls',
    sets: 3,
    reps: '15-20',
    description: 'Pull cable to face level, focus on rear delts',
    media: '/placeholder.svg?height=200&width=300&text=Face+Pulls'
  }
]

export default function PullPage() {
  return <WorkoutPage title="PULL WORKOUT" exercises={pullExercises} />
}
