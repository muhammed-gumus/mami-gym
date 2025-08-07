'use client'

import Link from 'next/link'
import { Dumbbell, Target, Zap, Heart, LogOut, User, History, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-xl">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center min-h-screen flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8">WORKOUT</h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              İdmanlarınızı takip etmek için giriş yapın
            </p>
            <Link href="/auth">
              <Button className="bg-black text-white hover:bg-gray-800 px-6 sm:px-8 py-3 text-base sm:text-lg">
                GİRİŞ YAP / KAYIT OL
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile Header */}
        <div className="block sm:hidden mb-8">
          {/* Top Bar - Mobile */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="border-black text-black hover:bg-black hover:text-white p-2"
                >
                  <User className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/history">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="border-black text-black hover:bg-black hover:text-white p-2"
                >
                  <History className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <Button 
              onClick={handleSignOut}
              size="sm"
              variant="outline" 
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white p-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Title - Mobile */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">WORKOUT</h1>
            <div className="bg-gray-100 rounded-lg px-4 py-2 mb-4">
              <p className="text-sm text-gray-600">
                Hoş geldin, <span className="font-semibold text-black">{user.email?.split('@')[0]}</span>
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Choose your training day
            </p>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block">
          {/* Top Navigation Bar - Desktop */}
          <div className="bg-gray-50 border-2 border-black p-4 mb-8">
            <div className="flex items-center justify-between">
              {/* Left Side - User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-black">
                    {user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-600">Aktif Kullanıcı</p>
                </div>
              </div>

              {/* Right Side - Action Buttons */}
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button 
                    variant="outline" 
                    className="border-black text-black hover:bg-black hover:text-white flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden md:inline">Profil</span>
                  </Button>
                </Link>
                
                <Link href="/history">
                  <Button 
                    variant="outline" 
                    className="border-black text-black hover:bg-black hover:text-white flex items-center gap-2"
                  >
                    <History className="w-4 h-4" />
                    <span className="hidden md:inline">Geçmiş</span>
                  </Button>
                </Link>
                
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Çıkış</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Title - Desktop */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4">WORKOUT</h1>
            <p className="text-lg md:text-xl text-gray-600">
              Choose your training day
            </p>
          </div>
        </div>

        {/* Workout Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* PUSH */}
          <Link href="/push" className="group">
            <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center hover:bg-black hover:text-white transition-all duration-300 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 group-hover:from-gray-800 group-hover:to-black transition-all duration-300"></div>
              <div className="relative z-10">
                <Dumbbell className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 mx-auto" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">PUSH</h2>
                <p className="text-sm sm:text-base md:text-lg opacity-80">Chest, Shoulders, Triceps</p>
                <div className="mt-3 text-xs sm:text-sm opacity-60">
                  6 Exercises • 45-60 min
                </div>
              </div>
            </div>
          </Link>

          {/* PULL */}
          <Link href="/pull" className="group">
            <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center hover:bg-black hover:text-white transition-all duration-300 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 group-hover:from-gray-800 group-hover:to-black transition-all duration-300"></div>
              <div className="relative z-10">
                <Target className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 mx-auto" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">PULL</h2>
                <p className="text-sm sm:text-base md:text-lg opacity-80">Back, Biceps</p>
                <div className="mt-3 text-xs sm:text-sm opacity-60">
                  6 Exercises • 45-60 min
                </div>
              </div>
            </div>
          </Link>

          {/* LEGS & ABS */}
          <Link href="/legs-abs" className="group">
            <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center hover:bg-black hover:text-white transition-all duration-300 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 group-hover:from-gray-800 group-hover:to-black transition-all duration-300"></div>
              <div className="relative z-10">
                <Zap className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 mx-auto" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">LEGS & ABS</h2>
                <p className="text-sm sm:text-base md:text-lg opacity-80">Lower Body, Core</p>
                <div className="mt-3 text-xs sm:text-sm opacity-60">
                  6 Exercises • 50-70 min
                </div>
              </div>
            </div>
          </Link>

          {/* CARDIO */}
          <Link href="/cardio" className="group">
            <div className="border-2 border-black p-6 sm:p-8 md:p-12 text-center hover:bg-black hover:text-white transition-all duration-300 min-h-[180px] sm:min-h-[200px] md:min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100 group-hover:from-gray-800 group-hover:to-black transition-all duration-300"></div>
              <div className="relative z-10">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mb-4 mx-auto" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">CARDIO</h2>
                <p className="text-sm sm:text-base md:text-lg opacity-80">Endurance Training</p>
                <div className="mt-3 text-xs sm:text-sm opacity-60">
                  HIIT or Incline • 20-45 min
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              💾 Tüm veriler güvenli bir şekilde veritabanında saklanır
            </p>
            <p className="text-xs text-gray-500">
              🔒 Kişisel bilgileriniz şifrelenir ve korunur
            </p>
          </div>
        </div>

        {/* Quick Stats - Mobile Only */}
        <div className="block sm:hidden mt-8">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-black">4</div>
              <div className="text-xs text-gray-600">Workout Types</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-black">24</div>
              <div className="text-xs text-gray-600">Total Exercises</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-black">∞</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
