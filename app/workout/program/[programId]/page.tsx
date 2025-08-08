"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Target, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import ExerciseCard from "@/components/exercise-card";
import { getWorkoutProgram } from "@/lib/program-actions";
import { saveWorkout } from "@/lib/workout-actions";

// Transform program exercise to workout exercise format
const transformExercise = (programExercise: any, index: number) => ({
  id: index + 1,
  name: programExercise.exercise_name,
  sets: programExercise.sets,
  reps: programExercise.reps,
  description: programExercise.description || "",
  media: programExercise.media_url || "",
});

export default function ProgramWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const programId = params.programId as string;

  const [program, setProgram] = useState<any>(null);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState(0);
  const [exercises, setExercises] = useState<any[]>([]);
  const [completedSets, setCompletedSets] = useState<{
    [key: string]: boolean;
  }>({});
  const [workoutStartTime] = useState(new Date());
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && programId) {
      loadProgram();
    }
  }, [user, programId]);

  // Update exercises when workout changes
  useEffect(() => {
    if (program && program.workouts && program.workouts.length > 0) {
      const currentWorkout = program.workouts[currentWorkoutIndex];
      if (currentWorkout && currentWorkout.exercises) {
        const transformedExercises = currentWorkout.exercises.map(
          (ex: any, index: number) => transformExercise(ex, index)
        );
        setExercises(transformedExercises);
        setCompletedSets({}); // Reset completed sets when switching workouts
      }
    }
  }, [currentWorkoutIndex, program]);

  const loadProgram = async () => {
    try {
      const result = await getWorkoutProgram(programId);
      if (result.success && result.data) {
        setProgram(result.data);

        // Get first workout and its exercises
        if (result.data.workouts && result.data.workouts.length > 0) {
          const firstWorkout = result.data.workouts[currentWorkoutIndex];
          if (firstWorkout.exercises) {
            const transformedExercises = firstWorkout.exercises.map(
              (ex: any, index: number) => transformExercise(ex, index)
            );
            setExercises(transformedExercises);
          }
        }
      } else {
        alert("Program bulunamadı");
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading program:", error);
      alert("Program yüklenirken hata oluştu");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const toggleSet = (exerciseId: number, setIndex: number) => {
    const key = `${exerciseId}-${setIndex}`;
    setCompletedSets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateExercise = (exerciseId: number, updates: any) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex))
    );
  };

  const deleteExercise = (exerciseId: number) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setCompletedSets((prev) => {
      const newCompletedSets = { ...prev };
      Object.keys(newCompletedSets).forEach((key) => {
        if (key.startsWith(`${exerciseId}-`)) {
          delete newCompletedSets[key];
        }
      });
      return newCompletedSets;
    });
  };

  const handleWorkoutComplete = async () => {
    if (isSaving || !user) return;

    if (!isWorkoutCompleted) {
      setIsSaving(true);

      try {
        const duration = Math.round(
          (new Date().getTime() - workoutStartTime.getTime()) / (1000 * 60)
        );

        const exercisesWithCompletedSets = exercises.map((exercise) => {
          const completedCount = Array.from(
            { length: exercise.sets },
            (_, i) => {
              const key = `${exercise.id}-${i}`;
              return completedSets[key] ? 1 : 0;
            }
          ).reduce((sum: number, val: number) => sum + val, 0);

          return {
            exercise_name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            description: exercise.description,
            media_url: exercise.media,
            completed_sets: completedCount,
          };
        });

        const workoutData = {
          title: `${program?.name || "Program"} - ${
            program.workouts?.[currentWorkoutIndex]?.name || "Workout"
          }`,
          workout_type: "program-based",
          notes: notes || undefined,
          duration_minutes: duration,
          exercises: exercisesWithCompletedSets,
        };

        const result = await saveWorkout(workoutData, user.id);

        if (result.success) {
          setIsWorkoutCompleted(true);
          alert("Antrenman başarıyla kaydedildi!");
          setTimeout(() => {
            router.push("/history");
          }, 1500);
        } else {
          console.error("Database save failed:", result.error);
          alert("Antrenman kaydedilirken hata oluştu: " + result.error);
          setIsWorkoutCompleted(true);
        }
      } catch (error) {
        console.error("Error saving workout:", error);
        alert("Antrenman kaydedilirken hata oluştu");
        setIsWorkoutCompleted(true);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-xl">Program yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Program bulunamadı</h1>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedExercises = exercises.filter((exercise) => {
    const totalSets = exercise.sets;
    const completedCount = Array.from({ length: totalSets }, (_, i) => {
      const key = `${exercise.id}-${i}`;
      return completedSets[key] ? 1 : 0;
    }).reduce((sum: number, val: number) => sum + val, 0);

    return completedCount > 0;
  }).length;

  const progressPercentage =
    exercises.length > 0 ? (completedExercises / exercises.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="outline" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold">{program.name}</h1>
            <p className="text-gray-600">{program.description}</p>
          </div>
        </div>

        {/* Workout Selection */}
        {program.workouts && program.workouts.length > 1 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Antrenman Seçin</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {program.workouts.map((workout: any, index: number) => (
                <button
                  key={workout.id}
                  onClick={() => setCurrentWorkoutIndex(index)}
                  className={`p-4 border-2 rounded text-left transition-all ${
                    currentWorkoutIndex === index
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-black"
                  }`}
                >
                  <div className="font-bold">{workout.name}</div>
                  <div className="text-sm opacity-75">
                    {workout.description || `Gün ${workout.day_number}`}
                  </div>
                  <div className="text-xs mt-2">
                    {workout.exercises?.length || 0} egzersiz
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Workout Info */}
        {program.workouts && program.workouts[currentWorkoutIndex] && (
          <div className="mb-6 p-4 bg-gray-50 border-2 border-black">
            <h3 className="font-bold text-lg">
              {program.workouts[currentWorkoutIndex].name}
            </h3>
            {program.workouts[currentWorkoutIndex].description && (
              <p className="text-gray-600">
                {program.workouts[currentWorkoutIndex].description}
              </p>
            )}
          </div>
        )}

        {/* Program Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Egzersizler</div>
            <div className="text-xl font-bold">{exercises.length}</div>
          </div>
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Tahmini Süre</div>
            <div className="text-xl font-bold">
              {(program.workouts &&
                program.workouts[currentWorkoutIndex]
                  ?.estimated_duration_minutes) ||
                60}{" "}
              dk
            </div>
          </div>
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <Award className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Tamamlanan</div>
            <div className="text-xl font-bold">
              {completedExercises}/{exercises.length}
            </div>
          </div>
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm text-gray-600">İlerleme</div>
            <div className="text-xl font-bold">
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Antrenman İlerlemesi: {Math.round(progressPercentage)}%
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-6 mb-8">
          {exercises.map((exercise) => (
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

        {/* Notes Section */}
        <div className="border-2 border-black p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Antrenman Notları</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded h-24"
            placeholder="Antrenmanla ilgili notlarınızı buraya yazabilirsiniz..."
          />
        </div>

        {/* Complete Workout Button */}
        <div className="text-center">
          {!isWorkoutCompleted ? (
            <Button
              onClick={handleWorkoutComplete}
              disabled={isSaving}
              className="bg-black text-white px-8 py-3 text-lg font-bold hover:bg-gray-800"
            >
              {isSaving ? "KAYDEDILIYOR..." : "ANTRENMANI TAMAMLA"}
            </Button>
          ) : (
            <div className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xl font-bold">ANTRENMAN TAMAMLANDI!</div>
              <div className="text-sm">
                Tebrikler! Antrenmanınız başarıyla kaydedildi.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
