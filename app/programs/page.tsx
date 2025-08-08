"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Play, Copy, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import {
  getProgramCategories,
  getWorkoutPrograms,
  copyTemplateProgram,
  deleteWorkoutProgram,
} from "@/lib/program-actions";

export default function ProgramsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showTemplates, setShowTemplates] = useState(true);
  const [showUserPrograms, setShowUserPrograms] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [categoriesResult, programsResult] = await Promise.all([
        getProgramCategories(),
        getWorkoutPrograms(user?.id, undefined, true),
      ]);

      if (categoriesResult.success) {
        setCategories(categoriesResult.data || []);
      }

      if (programsResult.success) {
        setAllPrograms(programsResult.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
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

  // Filter programs based on selected criteria
  const filteredPrograms = allPrograms.filter((program) => {
    const categoryMatch =
      selectedCategory === "all" || program.category_id === selectedCategory;
    const typeMatch =
      (showTemplates && program.is_template) ||
      (showUserPrograms && !program.is_template);
    return categoryMatch && typeMatch;
  });

  const templates = filteredPrograms.filter((p) => p.is_template);
  const userPrograms = filteredPrograms.filter((p) => !p.is_template);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">
              Antrenman Programları
            </h1>
          </div>
          <Link href="/programs/create">
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Program
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 border-2 border-black p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-bold mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filters */}
            <div>
              <label className="block text-sm font-bold mb-2">
                Program Türü
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showTemplates}
                    onChange={(e) => setShowTemplates(e.target.checked)}
                    className="mr-2"
                  />
                  Hazır Şablonlar ({templates.length})
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showUserPrograms}
                    onChange={(e) => setShowUserPrograms(e.target.checked)}
                    className="mr-2"
                  />
                  Benim Programlarım ({userPrograms.length})
                </label>
              </div>
            </div>

            {/* Stats */}
            <div>
              <label className="block text-sm font-bold mb-2">
                İstatistikler
              </label>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Toplam: {filteredPrograms.length} program</div>
                <div>Şablon: {templates.length}</div>
                <div>Kişisel: {userPrograms.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        {showTemplates && templates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Hazır Şablonlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((program) => (
                <div key={program.id} className="border-2 border-black p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold">{program.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {program.category?.name}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    {program.description}
                  </p>

                  <div className="text-xs text-gray-500 mb-4 space-y-1">
                    <div>📅 {program.duration_weeks} hafta</div>
                    <div>🔄 Haftada {program.frequency_per_week} gün</div>
                    <div>📊 {program.difficulty_level}</div>
                    <div>💪 {program.workouts?.length || 0} antrenman</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStartWorkout(program.id)}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Başla
                    </Button>
                    <Button
                      onClick={() => handleCopyTemplate(program.id)}
                      variant="outline"
                      size="sm"
                      title="Kopyala"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Programs Section */}
        {showUserPrograms && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Benim Programlarım</h2>
              <Link href="/programs/create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Program
                </Button>
              </Link>
            </div>

            {userPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPrograms.map((program) => (
                  <div
                    key={program.id}
                    className="border-2 border-gray-300 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold">{program.name}</h3>
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {program.category?.name}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">
                      {program.description}
                    </p>

                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div>📅 {program.duration_weeks} hafta</div>
                      <div>🔄 Haftada {program.frequency_per_week} gün</div>
                      <div>📊 {program.difficulty_level}</div>
                      <div>💪 {program.workouts?.length || 0} antrenman</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartWorkout(program.id)}
                        className="flex-1 bg-black text-white hover:bg-gray-800"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Başla
                      </Button>
                      <Link href={`/programs/edit/${program.id}`}>
                        <Button variant="outline" size="sm" title="Düzenle">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDeleteProgram(program.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">Henüz programınız yok</p>
                <Link href="/programs/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    İlk Programınızı Oluşturun
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Seçilen kriterlere uygun program bulunamadı
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => {
                  setSelectedCategory("all");
                  setShowTemplates(true);
                  setShowUserPrograms(true);
                }}
              >
                Filtreleri Temizle
              </Button>
              <Link href="/programs/create">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Program Oluştur
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
