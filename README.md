# MAMI GYM - Özelleştirilebilir Antrenman Uygulaması

Modern, minimalist ve kullanıcı dostu spor salonu antrenman takip uygulaması. Next.js, TypeScript ve Supabase ile geliştirilmiştir.

## 🚀 Yeni Özellikler

### ✨ Özelleştirilebilir Antrenman Programları

- **Hazır Şablonlar**: Push, Pull, Legs, Cardio, Full Body gibi profesyonel antrenman şablonları
- **Kişisel Programlar**: Kendi antrenman programlarınızı oluşturun ve özelleştirin
- **Program Kategorileri**: Antrenmanları kategorilere göre organize edin
- **Esnek Yapı**: Her programa özel egzersizler, set sayıları ve tekrar aralıkları

### 🎯 Gelişmiş Antrenman Takibi

- **İlerleme Takibi**: Gerçek zamanlı antrenman ilerlemesi
- **Set Tamamlama**: Her set için tamamlanma durumu takibi
- **Süre Ölçümü**: Otomatik antrenman süresi hesaplama
- **Notlar**: Antrenmanlarınız için kişisel notlar

### 💾 Güvenli Veri Yönetimi

- **Supabase Backend**: Modern ve güvenli veritabanı
- **Kullanıcı Kimlik Doğrulama**: Güvenli giriş sistemi
- **Veri Senkronizasyonu**: Tüm cihazlarda senkronize edilmiş veriler
- **Yedekleme**: Otomatik veri yedekleme

## 🏗️ Teknoloji Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📱 Özellikler

### Ana Özellikler

- ✅ Responsive tasarım (mobil ve masaüstü uyumlu)
- ✅ Kullanıcı kimlik doğrulama (kayıt/giriş)
- ✅ Antrenman programı yönetimi
- ✅ Egzersiz takibi ve düzenleme
- ✅ Antrenman geçmişi
- ✅ Kullanıcı profili yönetimi
- ✅ Gerçek zamanlı veri senkronizasyonu

### Program Yönetimi

- 📋 Hazır antrenman şablonları
- 🎨 Kişisel program oluşturma
- 📊 Program kategorileri
- 🔄 Şablon kopyalama
- ✏️ Program düzenleme
- 🗑️ Program silme

### Antrenman Takibi

- ⏱️ Süre takibi
- 📈 İlerleme gösterimi
- ✅ Set tamamlama
- 📝 Egzersiz notları
- 💪 Egzersiz ekleme/düzenleme

## 🚀 Kurulum

1. **Depoyu klonlayın**

```bash
git clone https://github.com/your-username/mami-gym.git
cd mami-gym
```

2. **Bağımlılıkları yükleyin**

```bash
npm install
# veya
pnpm install
```

3. **Çevre değişkenlerini ayarlayın**
   `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Veritabanını kurun**
   Supabase projenizde aşağıdaki SQL scriptleri çalıştırın:

```bash
# Temel veritabanı şeması
scripts/simple-database-setup.sql

# Program sistemi
scripts/add-program-system.sql

# Varsayılan programları ekle
scripts/insert-default-programs.sql
```

5. **Geliştirme sunucusunu başlatın**

```bash
npm run dev
# veya
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
mami-gym/
├── app/                    # Next.js App Router
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── programs/          # Program yönetim sayfaları
│   ├── workout/           # Antrenman sayfaları
│   ├── history/           # Antrenman geçmişi
│   └── profile/           # Kullanıcı profili
├── components/            # React bileşenleri
│   ├── ui/               # UI bileşenleri (Shadcn)
│   ├── auth-provider.tsx  # Kimlik doğrulama provider'ı
│   ├── exercise-card.tsx  # Egzersiz kartı
│   └── workout-page.tsx   # Antrenman sayfası
├── lib/                   # Utility fonksiyonları
│   ├── auth.ts           # Kimlik doğrulama
│   ├── supabase.ts       # Supabase client
│   ├── program-actions.ts # Program işlemleri
│   └── workout-actions.ts # Antrenman işlemleri
└── scripts/              # Veritabanı scriptleri
```

## 🗄️ Veritabanı Şeması

### Ana Tablolar

- `workouts` - Tamamlanan antrenmanlar
- `workout_exercises` - Antrenman egzersizleri
- `user_profile` - Kullanıcı profili bilgileri

### Program Sistemi Tabloları

- `program_categories` - Program kategorileri
- `workout_programs` - Antrenman programları
- `program_workouts` - Program içindeki antrenmanlar
- `program_exercises` - Program egzersizleri

## 🎨 Tasarım Prensipleri

- **Minimalizm**: Temiz ve sade arayüz
- **Kullanılabilirlik**: Kolay ve anlaşılır navigasyon
- **Responsive**: Tüm cihazlarda mükemmel görünüm
- **Performans**: Hızlı yükleme ve akıcı animasyonlar
- **Erişilebilirlik**: Herkes için kullanılabilir tasarım

## 🔧 Konfigürasyon

### Tailwind CSS

Projenin stil sistemi Tailwind CSS ve Shadcn/ui bileşenleri kullanılarak oluşturulmuştur.

### Supabase

Veritabanı ve kimlik doğrulama için Supabase kullanılmaktadır. Row Level Security (RLS) ile güvenlik sağlanmıştır.

## 📝 API Endpoints

### Program Actions

- `getProgramCategories()` - Program kategorilerini getir
- `getWorkoutPrograms()` - Kullanıcı programlarını getir
- `createWorkoutProgram()` - Yeni program oluştur
- `copyTemplateProgram()` - Şablon kopyala
- `deleteWorkoutProgram()` - Program sil

### Workout Actions

- `saveWorkout()` - Antrenman kaydet
- `getWorkoutHistory()` - Antrenman geçmişi getir
- `getUserProfile()` - Kullanıcı profili getir

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🚀 Deployment

Uygulama Vercel üzerinde deploy edilmiştir:

**[https://vercel.com/muhammedgumus-projects/v0-minimalist-workout-app](https://vercel.com/muhammedgumus-projects/v0-minimalist-workout-app)**

## 📞 İletişim

Proje hakkında sorularınız için GitHub Issues kullanabilirsiniz.

---

**🏋️‍♀️ MAMI GYM ile hedeflerinize ulaşın! 💪**
