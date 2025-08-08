"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Copy, Trash2, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import {
  getProgramCategories,
  getFilteredPrograms,
  copyTemplateProgram,
  deleteWorkoutProgram,
} from "@/lib/program-actions";

type FilterState = {
  targetGoal: string;
  difficultyLevel: string;
  equipmentType: string;
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    targetGoal: "",
    difficultyLevel: "",
    equipmentType: "",
  });

  useEffect(() => {
    if (user && categoryId) {
      loadData();
    }
  }, [user, categoryId]);

  useEffect(() => {
    if (user && categoryId) {
      loadFilteredData();
    }
  }, [filters, user, categoryId]);

  const loadData = async () => {
    try {
      const categoriesResult = await getProgramCategories();

      if (categoriesResult.success) {
        const foundCategory = categoriesResult.data?.find(
          (c: any) => c.id === categoryId
        );
        setCategory(foundCategory);
      }

      await loadFilteredData();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredData = async () => {
    try {
      const result = await getFilteredPrograms({
        userId: user?.id,
        categoryId: categoryId,
        targetGoal: filters.targetGoal || undefined,
        difficultyLevel: filters.difficultyLevel || undefined,
        equipmentType: filters.equipmentType || undefined,
        includeTemplates: true,
      });

      if (result.success) {
        setPrograms(result.data || []);
      }
    } catch (error) {
      console.error("Error loading filtered programs:", error);
    }
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== "");
  };

  const clearFilters = () => {
    setFilters({
      targetGoal: "",
      difficultyLevel: "",
      equipmentType: "",
    });
  };

  const handleCopyTemplate = async (templateId: string) => {
    if (!user) return;

    const result = await copyTemplateProgram(templateId, user.id);
    if (result.success) {
      alert("Program başarıyla kopyalandı!");
      loadData(); // Refresh data
    } else {
      alert("Program kopyalanırken hata oluştu: " + result.error);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!user) return;

    if (confirm("Bu programı silmek istediğinizden emin misiniz?")) {
      const result = await deleteWorkoutProgram(programId, user.id);
      if (result.success) {
        alert("Program başarıyla silindi!");
        loadData(); // Refresh data
      } else {
        alert("Program silinirken hata oluştu: " + result.error);
      }
    }
  };

  const handleStartWorkout = (programId: string) => {
    router.push(`/workout/program/${programId}`);
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

  if (!category) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Kategori bulunamadı</h1>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const templates = programs.filter((p) => p.is_template);
  const userPrograms = programs.filter((p) => !p.is_template);

  const difficultyMap: Record<string, string> = {
    beginner: "Başlangıç",
    intermediate: "Orta",
    advanced: "İleri",
  };

  const targetGoalMap: Record<string, string> = {
    weight_loss: "Kilo Verme",
    muscle_building: "Kas Yapma",
    strength: "Güçlenme",
    functional: "Fonksiyonel",
  };

  const equipmentMap: Record<string, string> = {
    bodyweight: "Vücut Ağırlığı",
    dumbbell: "Dumbbell",
    gym_equipment: "Salon Gereçleri",
    mixed: "Karışık",
  };

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
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            <p className="text-gray-600">{category.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`border-black text-black hover:bg-black hover:text-white ${
                hasActiveFilters() ? "bg-black text-white" : ""
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtrele
            </Button>
            <Link href="/programs/create">
              <Button className="bg-black text-white hover:bg-gray-800">
                <Plus className="w-4 h-4 mr-2" />
                Program Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-6 border-2 border-black bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">FİLTRELER</h3>
              {hasActiveFilters() && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  Temizle
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hedef */}
              <div>
                <label className="block text-sm font-bold mb-2">🎯 Hedef</label>
                <select
                  value={filters.targetGoal}
                  onChange={(e) =>
                    setFilters({ ...filters, targetGoal: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="">Tümü</option>
                  <option value="weight_loss">Kilo Verme</option>
                  <option value="muscle_building">Kas Yapma</option>
                  <option value="strength">Güçlenme</option>
                  <option value="functional">Fonksiyonel</option>
                </select>
              </div>

              {/* Seviye */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  📊 Seviye
                </label>
                <select
                  value={filters.difficultyLevel}
                  onChange={(e) =>
                    setFilters({ ...filters, difficultyLevel: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="">Tümü</option>
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>

              {/* Ekipman */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  🏋️ Ekipman
                </label>
                <select
                  value={filters.equipmentType}
                  onChange={(e) =>
                    setFilters({ ...filters, equipmentType: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                >
                  <option value="">Tümü</option>
                  <option value="bodyweight">Vücut Ağırlığı</option>
                  <option value="dumbbell">Dumbbell</option>
                  <option value="gym_equipment">Salon Gereçleri</option>
                  <option value="mixed">Karışık</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.targetGoal && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                🎯 {targetGoalMap[filters.targetGoal]}
              </span>
            )}
            {filters.difficultyLevel && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                📊 {difficultyMap[filters.difficultyLevel]}
              </span>
            )}
            {filters.equipmentType && (
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm">
                🏋️ {equipmentMap[filters.equipmentType]}
              </span>
            )}
          </div>
        )}

        {/* Program Templates */}
        {templates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">HAZIR ŞABLONLAR</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((program) => (
                <div
                  key={program.id}
                  className="border-2 border-black p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{program.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Şablon
                    </span>
                  </div>

                  {program.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {program.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {program.difficulty_level && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {difficultyMap[program.difficulty_level] ||
                          program.difficulty_level}
                      </span>
                    )}
                    {program.target_goal && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {targetGoalMap[program.target_goal] ||
                          program.target_goal}
                      </span>
                    )}
                    {program.equipment_type && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {equipmentMap[program.equipment_type] ||
                          program.equipment_type}
                      </span>
                    )}
                    {program.workouts && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {program.workouts.length} Antrenman
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartWorkout(program.id)}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Başla
                    </Button>
                    <Button
                      onClick={() => handleCopyTemplate(program.id)}
                      variant="outline"
                      className="border-black text-black hover:bg-black hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Programs */}
        {userPrograms.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">KİŞİSEL PROGRAMLARINIZ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrograms.map((program) => (
                <div
                  key={program.id}
                  className="border-2 border-black p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{program.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Kişisel
                    </span>
                  </div>

                  {program.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                      {program.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    {program.difficulty_level && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {difficultyMap[program.difficulty_level] ||
                          program.difficulty_level}
                      </span>
                    )}
                    {program.target_goal && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {targetGoalMap[program.target_goal] ||
                          program.target_goal}
                      </span>
                    )}
                    {program.equipment_type && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {equipmentMap[program.equipment_type] ||
                          program.equipment_type}
                      </span>
                    )}
                    {program.workouts && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {program.workouts.length} Antrenman
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartWorkout(program.id)}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Başla
                    </Button>
                    <Button
                      onClick={() => handleDeleteProgram(program.id)}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {programs.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">
              {hasActiveFilters()
                ? "Filtrelere uygun program bulunamadı"
                : "Bu kategoride henüz program bulunmuyor"}
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters()
                ? "Filtreleri değiştirin veya kendi programınızı oluşturun."
                : "İlk programınızı oluşturun ve antrenmanlarınıza başlayın."}
            </p>
            <div className="flex gap-4 justify-center">
              {hasActiveFilters() && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white"
                >
                  Filtreleri Temizle
                </Button>
              )}
              <Link href="/programs/create">
                <Button className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Program Oluştur
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
