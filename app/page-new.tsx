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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Push */}
            <Link href="/push" className="group">
              <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 text-center">
                <Dumbbell className="w-12 h-12 mx-auto mb-4 group-hover:text-white" />
                <h3 className="text-xl font-bold mb-2">PUSH</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300">
                  Göğüs, Omuz, Triceps
                </p>
              </div>
            </Link>

            {/* Pull */}
            <Link href="/pull" className="group">
              <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 group-hover:text-white" />
                <h3 className="text-xl font-bold mb-2">PULL</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300">
                  Sırt, Biceps
                </p>
              </div>
            </Link>

            {/* Legs & Abs */}
            <Link href="/legs-abs" className="group">
              <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 group-hover:text-white" />
                <h3 className="text-xl font-bold mb-2">LEGS & ABS</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300">
                  Bacak, Kalça, Karın
                </p>
              </div>
            </Link>

            {/* Cardio */}
            <Link href="/cardio" className="group">
              <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-all duration-300 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 group-hover:text-white" />
                <h3 className="text-xl font-bold mb-2">CARDIO</h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-300">
                  Kondisyon, Dayanıklılık
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Suggestion */}
        <div className="bg-gray-50 border-2 border-black p-6 text-center">
          <h3 className="text-lg font-bold mb-3">BUGÜN İÇİN ÖNERİ</h3>
          <p className="text-gray-600 mb-4">
            Hangi kas grubunu çalışmak istiyorsun?
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/push">
              <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
                PUSH'a Başla
              </Button>
            </Link>
            <Link href="/programs">
              <Button
                variant="outline"
                className="border-black w-full sm:w-auto"
              >
                Programları Gör
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
