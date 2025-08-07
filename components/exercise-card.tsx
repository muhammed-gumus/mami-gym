'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  description: string
  media?: string
}

interface ExerciseCardProps {
  exercise: Exercise
  completedSets: Record<string, boolean>
  onToggleSet: (exerciseId: number, setIndex: number) => void
  onUpdateExercise: (exerciseId: number, updates: Partial<Exercise>) => void
  onDeleteExercise: (exerciseId: number) => void
}

export default function ExerciseCard({ 
  exercise, 
  completedSets, 
  onToggleSet, 
  onUpdateExercise,
  onDeleteExercise 
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    sets: exercise.sets,
    reps: exercise.reps,
    media: exercise.media || ''
  })

  const handleSave = () => {
    onUpdateExercise(exercise.id, {
      sets: editData.sets,
      reps: editData.reps,
      media: editData.media || undefined
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      sets: exercise.sets,
      reps: exercise.reps,
      media: exercise.media || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="border-2 border-black">
      {/* Card Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold">{exercise.name}</h3>
            <p className="text-sm md:text-base text-gray-600">
              {exercise.sets} sets × {exercise.reps} reps
            </p>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-black p-4">
          {/* Edit Mode */}
          {isEditing ? (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Sets</label>
                  <input
                    type="number"
                    value={editData.sets}
                    onChange={(e) => setEditData(prev => ({ ...prev, sets: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Reps</label>
                  <input
                    type="text"
                    value={editData.reps}
                    onChange={(e) => setEditData(prev => ({ ...prev, reps: e.target.value }))}
                    className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Media URL (Image/Video)</label>
                <input
                  type="url"
                  value={editData.media}
                  onChange={(e) => setEditData(prev => ({ ...prev, media: e.target.value }))}
                  placeholder="https://example.com/image.jpg or YouTube URL"
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" className="border-black">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Description */}
              <p className="text-sm md:text-base mb-4">{exercise.description}</p>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-100"
                  size="sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this exercise?')) {
                      onDeleteExercise(exercise.id)
                    }
                  }}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Media */}
              {exercise.media && (
                <div className="mb-4">
                  {exercise.media.includes('youtube.com') || exercise.media.includes('youtu.be') ? (
                    <div className="aspect-video">
                      <iframe
                        src={exercise.media.replace('watch?v=', 'embed/')}
                        className="w-full h-full border border-gray-300"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <Image
                      src={exercise.media || "/placeholder.svg"}
                      alt={exercise.name}
                      width={300}
                      height={200}
                      className="w-full max-w-sm mx-auto border border-gray-300"
                    />
                  )}
                </div>
              )}

              {/* Set Checkboxes */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm md:text-base">SETS:</h4>
                {Array.from({ length: exercise.sets }, (_, index) => {
                  const key = `${exercise.id}-${index}`
                  const isCompleted = completedSets[key]
                  return (
                    <label key={index} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => onToggleSet(exercise.id, index)}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm md:text-base ${
                        isCompleted ? 'line-through opacity-50' : ''
                      }`}>
                        Set {index + 1}: {exercise.reps} reps
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
