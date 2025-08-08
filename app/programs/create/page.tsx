"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import {
  getProgramCategories,
  createWorkoutProgram,
  CreateProgramData,
} from "@/lib/program-actions";

export default function CreateProgramPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preselectedCategoryId = searchParams.get("category");

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [programData, setProgramData] = useState<CreateProgramData>({
    name: "",
    description: "",
    category_id: preselectedCategoryId || "",
    duration_weeks: 4,
    frequency_per_week: 3,
    difficulty_level: "intermediate",
    workouts: [],
  });

  // Weekly schedule state (7 days)
  const [weeklySchedule, setWeeklySchedule] = useState<{ [key: number]: any }>(
    {}
  );

  const dayNames = [
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi",
    "Pazar",
  ];

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const result = await getProgramCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!programData.name.trim()) {
      alert("Program adı gereklidir");
      return;
    }

    if (!programData.category_id) {
      alert("Kategori seçmelisiniz");
      return;
    }

    // Convert weekly schedule to workouts array
    const workouts = Object.entries(weeklySchedule)
      .filter(
        ([day, workout]) =>
          workout && workout.exercises && workout.exercises.length > 0
      )
      .map(([day, workout]) => ({
        name: workout.name || `${dayNames[parseInt(day) - 1]} Antrenmanı`,
        description: workout.description || "",
        day_number: parseInt(day),
        week_number: 1,
        estimated_duration_minutes: workout.estimated_duration_minutes || 60,
        exercises: workout.exercises.filter((ex: any) =>
          ex.exercise_name.trim()
        ),
      }));

    if (workouts.length === 0) {
      alert("En az bir güne antrenman eklemelisiniz");
      return;
    }

    const finalProgramData = {
      ...programData,
      workouts,
    };

    setSaving(true);
    try {
      const result = await createWorkoutProgram(finalProgramData, user.id);
      if (result.success) {
        alert("Program başarıyla oluşturuldu!");
        router.push(`/programs/category/${programData.category_id}`);
      } else {
        alert("Program oluşturulurken hata oluştu: " + result.error);
      }
    } catch (error) {
      console.error("Error creating program:", error);
      alert("Program oluşturulurken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const addWorkoutToDay = (dayNumber: number) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayNumber]: {
        name: `${dayNames[dayNumber - 1]} Antrenmanı`,
        description: "",
        estimated_duration_minutes: 60,
        exercises: [
          {
            exercise_name: "",
            sets: 3,
            reps: "8-12",
            rest_seconds: 60,
            description: "",
            order_index: 1,
          },
        ],
      },
    }));
  };

  const removeWorkoutFromDay = (dayNumber: number) => {
    setWeeklySchedule((prev) => {
      const newSchedule = { ...prev };
      delete newSchedule[dayNumber];
      return newSchedule;
    });
  };

  const updateDayWorkout = (dayNumber: number, field: string, value: any) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [field]: value,
      },
    }));
  };

  const addExerciseToDay = (dayNumber: number) => {
    setWeeklySchedule((prev) => {
      const currentWorkout = prev[dayNumber];
      if (!currentWorkout) return prev;

      return {
        ...prev,
        [dayNumber]: {
          ...currentWorkout,
          exercises: [
            ...(currentWorkout.exercises || []),
            {
              exercise_name: "",
              sets: 3,
              reps: "8-12",
              rest_seconds: 60,
              description: "",
              order_index: (currentWorkout.exercises?.length || 0) + 1,
            },
          ],
        },
      };
    });
  };

  const removeExerciseFromDay = (dayNumber: number, exerciseIndex: number) => {
    setWeeklySchedule((prev) => {
      const currentWorkout = prev[dayNumber];
      if (!currentWorkout) return prev;

      return {
        ...prev,
        [dayNumber]: {
          ...currentWorkout,
          exercises:
            currentWorkout.exercises?.filter(
              (_: any, i: number) => i !== exerciseIndex
            ) || [],
        },
      };
    });
  };

  const updateDayExercise = (
    dayNumber: number,
    exerciseIndex: number,
    field: string,
    value: any
  ) => {
    setWeeklySchedule((prev) => {
      const currentWorkout = prev[dayNumber];
      if (!currentWorkout) return prev;

      return {
        ...prev,
        [dayNumber]: {
          ...currentWorkout,
          exercises:
            currentWorkout.exercises?.map((exercise: any, i: number) =>
              i === exerciseIndex ? { ...exercise, [field]: value } : exercise
            ) || [],
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Yeni Program Oluştur</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Program Basic Info */}
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">Program Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Program Adı *
                </label>
                <input
                  type="text"
                  value={programData.name}
                  onChange={(e) =>
                    setProgramData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Örn: Benim Full Body Programım"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Kategori *
                </label>
                <select
                  value={programData.category_id}
                  onChange={(e) =>
                    setProgramData((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Kategori seçin</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Süre (Hafta)
                </label>
                <input
                  type="number"
                  value={programData.duration_weeks}
                  onChange={(e) =>
                    setProgramData((prev) => ({
                      ...prev,
                      duration_weeks: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  min="1"
                  max="52"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Haftalık Sıklık
                </label>
                <input
                  type="number"
                  value={programData.frequency_per_week}
                  onChange={(e) =>
                    setProgramData((prev) => ({
                      ...prev,
                      frequency_per_week: parseInt(e.target.value),
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  min="1"
                  max="7"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">
                  Zorluk Seviyesi
                </label>
                <select
                  value={programData.difficulty_level}
                  onChange={(e) =>
                    setProgramData((prev) => ({
                      ...prev,
                      difficulty_level: e.target.value,
                    }))
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold mb-1">Açıklama</label>
              <textarea
                value={programData.description}
                onChange={(e) =>
                  setProgramData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded h-20"
                placeholder="Program hakkında kısa açıklama..."
              />
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="border-2 border-black p-6">
            <h2 className="text-xl font-bold mb-4">
              Haftalık Antrenman Programı
            </h2>
            <p className="text-gray-600 mb-6">
              Haftanın hangi günlerinde antrenman yapacağınızı planlayın. Her
              güne özel egzersizler ekleyebilirsiniz.
            </p>

            <div className="space-y-4">
              {dayNames.map((dayName, index) => {
                const dayNumber = index + 1;
                const dayWorkout = weeklySchedule[dayNumber];
                const hasWorkout = Boolean(dayWorkout);

                return (
                  <div
                    key={dayNumber}
                    className="border border-gray-300 rounded-lg"
                  >
                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">
                          {dayNumber}. {dayName}
                        </span>
                        {hasWorkout && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {dayWorkout.exercises?.length || 0} egzersiz
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!hasWorkout ? (
                          <Button
                            onClick={() => addWorkoutToDay(dayNumber)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Antrenman Ekle
                          </Button>
                        ) : (
                          <Button
                            onClick={() => removeWorkoutFromDay(dayNumber)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Kaldır
                          </Button>
                        )}
                      </div>
                    </div>

                    {hasWorkout && (
                      <div className="p-4 border-t">
                        {/* Workout Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-bold mb-1">
                              Antrenman Adı
                            </label>
                            <input
                              type="text"
                              value={dayWorkout.name || ""}
                              onChange={(e) =>
                                updateDayWorkout(
                                  dayNumber,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold mb-1">
                              Tahmini Süre (dk)
                            </label>
                            <input
                              type="number"
                              value={
                                dayWorkout.estimated_duration_minutes || 60
                              }
                              onChange={(e) =>
                                updateDayWorkout(
                                  dayNumber,
                                  "estimated_duration_minutes",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded text-sm"
                              min="15"
                              max="180"
                            />
                          </div>

                          <div className="flex items-end">
                            <Button
                              onClick={() => addExerciseToDay(dayNumber)}
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Egzersiz Ekle
                            </Button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-bold mb-1">
                            Açıklama
                          </label>
                          <textarea
                            value={dayWorkout.description || ""}
                            onChange={(e) =>
                              updateDayWorkout(
                                dayNumber,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded text-sm h-16"
                            placeholder="Bu günün antrenman açıklaması..."
                          />
                        </div>

                        {/* Exercises */}
                        {dayWorkout.exercises &&
                          dayWorkout.exercises.length > 0 && (
                            <div className="space-y-3">
                              <h4 className="font-semibold">Egzersizler</h4>
                              {dayWorkout.exercises.map(
                                (exercise: any, exerciseIndex: number) => (
                                  <div
                                    key={exerciseIndex}
                                    className="bg-gray-50 p-3 rounded border"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-sm">
                                        Egzersiz {exerciseIndex + 1}
                                      </span>
                                      <Button
                                        onClick={() =>
                                          removeExerciseFromDay(
                                            dayNumber,
                                            exerciseIndex
                                          )
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                      <div>
                                        <label className="block text-xs font-bold mb-1">
                                          Egzersiz Adı
                                        </label>
                                        <input
                                          type="text"
                                          value={exercise.exercise_name || ""}
                                          onChange={(e) =>
                                            updateDayExercise(
                                              dayNumber,
                                              exerciseIndex,
                                              "exercise_name",
                                              e.target.value
                                            )
                                          }
                                          className="w-full p-1 border border-gray-300 rounded text-sm"
                                          placeholder="Örn: Bench Press"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1">
                                          Set
                                        </label>
                                        <input
                                          type="number"
                                          value={exercise.sets || 3}
                                          onChange={(e) =>
                                            updateDayExercise(
                                              dayNumber,
                                              exerciseIndex,
                                              "sets",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-full p-1 border border-gray-300 rounded text-sm"
                                          min="1"
                                          max="10"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1">
                                          Tekrar
                                        </label>
                                        <input
                                          type="text"
                                          value={exercise.reps || "8-12"}
                                          onChange={(e) =>
                                            updateDayExercise(
                                              dayNumber,
                                              exerciseIndex,
                                              "reps",
                                              e.target.value
                                            )
                                          }
                                          className="w-full p-1 border border-gray-300 rounded text-sm"
                                          placeholder="8-12"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-bold mb-1">
                                          Dinlenme (sn)
                                        </label>
                                        <input
                                          type="number"
                                          value={exercise.rest_seconds || 60}
                                          onChange={(e) =>
                                            updateDayExercise(
                                              dayNumber,
                                              exerciseIndex,
                                              "rest_seconds",
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="w-full p-1 border border-gray-300 rounded text-sm"
                                          min="30"
                                          max="300"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-bold mb-1">
                                        Açıklama
                                      </label>
                                      <textarea
                                        value={exercise.description || ""}
                                        onChange={(e) =>
                                          updateDayExercise(
                                            dayNumber,
                                            exerciseIndex,
                                            "description",
                                            e.target.value
                                          )
                                        }
                                        className="w-full p-1 border border-gray-300 rounded text-sm h-12"
                                        placeholder="Egzersiz tekniği ve ipuçları..."
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
