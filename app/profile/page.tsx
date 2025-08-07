'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { getUserProfile, saveUserProfile } from '@/lib/workout-actions'

export type UserProfile = {
  id?: string
  user_id?: string
  height_cm?: number
  weight_kg?: number
  age?: number
  gender?: string
  body_fat_percentage?: number
  muscle_mass_kg?: number
  chest_cm?: number
  waist_cm?: number
  bicep_cm?: number
  thigh_cm?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    loadProfile()
  }, [user, router])

  const loadProfile = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await getUserProfile(user.id)
      if (result.success) {
        setProfile(result.profile || {})
      } else {
        console.error('Error loading profile:', result.error)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    setSaveSuccess(false)
    
    try {
      const result = await saveUserProfile(profile, user.id)
      if (result.success) {
        setProfile(result.profile)
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert('Profil kaydedilirken hata oluştu: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Profil kaydedilirken hata oluştu.')
    }
    
    setSaving(false)
  }

  const updateProfile = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <div className="text-xl">Profil yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">KİŞİSEL BİLGİLER</h1>
        </div>

        {saveSuccess && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="border-2 border-green-600 bg-green-50 p-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-600 font-semibold">
                Profil bilgileri başarıyla kaydedildi!
              </span>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto">
          {/* User Info */}
          <div className="border-2 border-blue-300 bg-blue-50 p-4 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-semibold">Giriş yapılan hesap: {user.email}</span>
            </div>
          </div>

          {/* Basic Information */}
          <div className="border-2 border-black p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              <h2 className="text-xl font-bold">TEMEL BİLGİLER</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Yaş</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => updateProfile('age', parseInt(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Cinsiyet</label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) => updateProfile('gender', e.target.value)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                >
                  <option value="">Seçiniz</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Boy (cm)</label>
                <input
                  type="number"
                  value={profile.height_cm || ''}
                  onChange={(e) => updateProfile('height_cm', parseInt(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Kilo (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.weight_kg || ''}
                  onChange={(e) => updateProfile('weight_kg', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="70.5"
                />
              </div>
            </div>
          </div>

          {/* Body Composition */}
          <div className="border-2 border-black p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">VÜCUT KOMPOZİSYONU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Vücut Yağ Oranı (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.body_fat_percentage || ''}
                  onChange={(e) => updateProfile('body_fat_percentage', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="15.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Kas Kütlesi (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.muscle_mass_kg || ''}
                  onChange={(e) => updateProfile('muscle_mass_kg', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="55.2"
                />
              </div>
            </div>
          </div>

          {/* Body Measurements */}
          <div className="border-2 border-black p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">VÜCUT ÖLÇÜLERİ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Göğüs (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.chest_cm || ''}
                  onChange={(e) => updateProfile('chest_cm', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="95.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Bel (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.waist_cm || ''}
                  onChange={(e) => updateProfile('waist_cm', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="80.0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Bicep (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.bicep_cm || ''}
                  onChange={(e) => updateProfile('bicep_cm', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="35.5"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Uyluk (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.thigh_cm || ''}
                  onChange={(e) => updateProfile('thigh_cm', parseFloat(e.target.value) || undefined)}
                  className="w-full p-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="55.0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-2 border-black p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">NOTLAR</h2>
            <textarea
              value={profile.notes || ''}
              onChange={(e) => updateProfile('notes', e.target.value)}
              placeholder="Hedefleriniz, sağlık durumunuz veya diğer notlarınız..."
              className="w-full h-24 p-3 border border-gray-300 resize-none focus:outline-none focus:border-black"
            />
          </div>

          {/* BMI Calculation */}
          {profile.height_cm && profile.weight_kg && (
            <div className="border-2 border-black p-6 mb-6 bg-gray-50">
              <h2 className="text-xl font-bold mb-4">HESAPLANAN DEĞERLER</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">BMI (Vücut Kitle İndeksi)</label>
                  <div className="text-2xl font-bold">
                    {((profile.weight_kg / ((profile.height_cm / 100) ** 2))).toFixed(1)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">İdeal Kilo Aralığı (kg)</label>
                  <div className="text-lg">
                    {(18.5 * ((profile.height_cm / 100) ** 2)).toFixed(1)} - {(24.9 * ((profile.height_cm / 100) ** 2)).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 text-lg font-bold bg-black text-white hover:bg-gray-800"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'KAYDEDİLİYOR...' : 'BİLGİLERİ KAYDET'}
          </Button>
        </div>
      </div>
    </div>
  )
}
