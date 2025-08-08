"use client";

import Link from "next/link";
import {
  Dumbbell,
  Target,
  Zap,
  Heart,
  LogOut,
  User,
  History,
  Plus,
  Activity,
  Users,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getProgramCategories } from "@/lib/program-actions";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (user) {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const result = await getProgramCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        // Database güncellenene kadar geçici kategoriler
        setCategories([
          {
            id: "temp-1",
            name: "Full Body",
            description:
              "Tek seansta tüm vücut kaslarını çalıştıran programlar",
            icon: "Activity",
            color: "bg-orange-500",
          },
          {
            id: "temp-2",
            name: "PPL (Push/Pull/Legs)",
            description: "Push-Pull-Legs sistemi: 3 günlük split program",
            icon: "Dumbbell",
            color: "bg-blue-500",
          },
          {
            id: "temp-3",
            name: "Upper Lower Split",
            description:
              "Üst vücut ve alt vücut ayrı günlerde çalışılan split programlar",
            icon: "Users",
            color: "bg-teal-500",
          },
          {
            id: "temp-4",
            name: "Bro Split",
            description:
              "Her kas grubunun ayrı günde çalışıldığı bodypart split programları",
            icon: "User",
            color: "bg-slate-500",
          },
          {
            id: "temp-5",
            name: "Cardio Conditioning",
            description:
              "Kardiyovasküler dayanıklılık ve kondisyon programları",
            icon: "Heart",
            color: "bg-red-500",
          },
          {
            id: "temp-6",
            name: "Custom Program",
            description: "Kullanıcının kendi oluşturduğu özel programlar",
            icon: "Settings",
            color: "bg-gray-500",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      // Hata durumunda da geçici kategorileri göster
      setCategories([
        {
          id: "temp-1",
          name: "Full Body",
          description: "Tek seansta tüm vücut kaslarını çalıştıran programlar",
          icon: "Activity",
          color: "bg-orange-500",
        },
        {
          id: "temp-2",
          name: "PPL (Push/Pull/Legs)",
          description: "Push-Pull-Legs sistemi: 3 günlük split program",
          icon: "Dumbbell",
          color: "bg-blue-500",
        },
        {
          id: "temp-3",
          name: "Upper Lower Split",
          description:
            "Üst vücut ve alt vücut ayrı günlerde çalışılan split programlar",
          icon: "Users",
          color: "bg-teal-500",
        },
        {
          id: "temp-4",
          name: "Bro Split",
          description:
            "Her kas grubunun ayrı günde çalışıldığı bodypart split programları",
          icon: "User",
          color: "bg-slate-500",
        },
        {
          id: "temp-5",
          name: "Cardio Conditioning",
          description: "Kardiyovasküler dayanıklılık ve kondisyon programları",
          icon: "Heart",
          color: "bg-red-500",
        },
        {
          id: "temp-6",
          name: "Custom Program",
          description: "Kullanıcının kendi oluşturduğu özel programlar",
          icon: "Settings",
          color: "bg-gray-500",
        },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Redirect to auth if not logged in
  if (!user && !loading) {
    router.push("/auth");
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getIconComponent = (iconName?: string) => {
    const icons: Record<string, any> = {
      Dumbbell,
      Target,
      Zap,
      Heart,
      Activity,
      Users,
      User,
      Settings,
    };
    return icons[iconName || "Dumbbell"] || Dumbbell;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">MAMI GYM</h1>
            <p className="text-gray-600">
              Hoş geldin, {user?.email?.split("@")[0]}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/profile">
            <Button
              variant="outline"
              className="w-full h-20 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            >
              <div className="text-center">
                <User className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-bold">PROFİL</span>
              </div>
            </Button>
          </Link>

          <Link href="/history">
            <Button
              variant="outline"
              className="w-full h-20 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            >
              <div className="text-center">
                <History className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-bold">GEÇMİŞ</span>
              </div>
            </Button>
          </Link>

          <Link href="/programs">
            <Button
              variant="outline"
              className="w-full h-20 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-bold">PROGRAMLAR</span>
              </div>
            </Button>
          </Link>

          <Link href="/programs/create">
            <Button
              variant="outline"
              className="w-full h-20 border-2 border-black hover:bg-black hover:text-white transition-all duration-200"
            >
              <div className="text-center">
                <Plus className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm font-bold">OLUŞTUR</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Main Workout Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ANTRENMAN KATEGORİLERİ
          </h2>

          {loadingCategories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Kategoriler yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => {
                const IconComponent = getIconComponent(category.icon);
                return (
                  <Link
                    key={category.id}
                    href={`/programs/category/${category.id}`}
                    className="group"
                  >
                    <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 text-center">
                      <IconComponent className="w-12 h-12 mx-auto mb-4 group-hover:text-white" />
                      <h3 className="text-xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-300">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Suggestion */}
        <div className="bg-gray-50 border-2 border-black p-6 text-center">
          <h3 className="text-lg font-bold mb-3">BUGÜN İÇİN ÖNERİ</h3>
          <p className="text-gray-600 mb-4">
            Hangi kategoriden antrenman yapmak istiyorsun?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/programs">
              <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
                Programları Keşfet
              </Button>
            </Link>
            <Link href="/programs/create">
              <Button
                variant="outline"
                className="border-black w-full sm:w-auto"
              >
                Kendi Programını Oluştur
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
