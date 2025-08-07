'use client'

import { useState } from 'react'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { signUp, signIn } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        alert('Kayıt başarılı! Email adresinizi kontrol edin.')
        setIsLogin(true)
      }
    } catch (error: any) {
      setError(error.message || 'Bir hata oluştu')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
          </h1>
        </div>

        <div className="max-w-md mx-auto">
          <div className="border-2 border-black p-8">
            <div className="flex items-center justify-center mb-6">
              <User className="w-12 h-12" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg font-bold bg-black text-white hover:bg-gray-800"
              >
                {loading ? 'İŞLEM YAPILIYOR...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-black"
              >
                {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
