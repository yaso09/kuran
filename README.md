# 📖 Modern Kuran Platformu

![License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-cyan)
![PWA](https://img.shields.io/badge/PWA-Ready-orange)

Modern web teknolojileri kullanılarak geliştirilmiş, son derece kapsamlı, sosyal etkileşim odaklı ve yapay zeka destekli yeni nesil Kuran-ı Kerim platformu. Bu proje, sadece bir okuma uygulaması değil, aynı zamanda kullanıcıların dini konularda etkileşime girebileceği, günlük ibadetlerini takip edebileceği ve oyunlaştırma öğeleriyle motive olabileceği bir ekosistem sunar.

---

## 📑 İçindekiler Kılavuzu

1. [🌟 Detaylı Özellik İncelemesi](#-detaylı-özellik-incelemesi)
   - [Kuran Okuma Modülü](#1-kuran-okuma-modülü)
   - [Sosyal Etkileşim ve Forum](#2-sosyal-etkileşim-ve-forum)
   - [İbadet Asistanı](#3-ibadet-asistanı)
   - [Oyunlaştırma (Gamification)](#4-oyunlaştırma-gamification)
   - [Platform Analitiği (Nabız)](#5-platform-analitiği-nabız)
   - [Bildirim Altyapısı](#6-bildirim-push-notification-altyapısı)
2. [🏗 Teknik Mimari ve Altyapı](#-teknik-mimari-ve-altyapı)
3. [🗄 Veritabanı Şeması](#-veritabanı-şeması)
4. [🔌 API Dokümantasyonu](#-api-dokümantasyonu)
5. [📱 Mobil ve PWA Özellikleri](#-mobil-ve-pwa-özellikleri)
6. [🧩 Özel Bileşenler ve Kancalar (Hooks)](#-özel-bileşenler-ve-kancalar-hooks)
7. [⚙️ Kurulum ve Geliştirme](#-kurulum-ve-geliştirme)
8. [🚀 Dağıtım (Deployment)](#-dağıtım-deployment)
9. [📝 Lisans Bilgisi](#-lisans-bilgisi)

---

## 🌟 Detaylı Özellik İncelemesi

### 1. Kuran Okuma Modülü
Bu modül, uygulamanın çekirdeğini oluşturur ve kullanıcı deneyimi (UX) en üst düzeyde tutulacak şekilde tasarlanmıştır.

- **Hibrit Görünüm Motoru**:
  - **Mealli Mod (Full View)**: Bu modda ayetler kartlar halinde listelenir. Her kartta Arapça metin ve Türkçe meal (seçilebilir kaynak: Diyanet, Hayrat, Ö.N. Bilmen) bulunur.
  - **İbadet Modu (Reading View)**: "Mushaf" deneyimini dijital ortama taşır. Tüm dikkat dağıtıcı unsurlar (butonlar, menüler, mealler) gizlenir. Sadece yüksek kontrastlı, okunaklı Arapça metin ekrana gelir.
- **Akıllı Ses Çalar (Audio Engine)**:
  - `HTML5 Audo API` üzerine kurulmuştur.
  - **Wake Lock API Entegrasyonu**: Sure dinlenirken telefon ekranının kapanmasını engeller.
  - **Sure Sıralı Çalma**: Bir sure bittiğinde otomatik olarak sıradaki sureye geçer.
  - **Arka Plan Oynatma**: PWA özelliği sayesinde uygulama arka plandayken veya ekran kilitliyken çalmaya devam eder.
- **Dinamik Meal Kaynakları**: Kullanıcı tercihine göre anlık olarak değişebilen meal altyapısı (Diyanet, Elmalılı, Ö.N. Bilmen, Hayrat Neşriyat).

### 2. Sosyal Etkileşim ve Forum
Kullanıcıların statik içerik tüketiminden çıkıp, dinamik bir topluluğun parçası olmasını sağlar.

- **Konusal Kategorizasyon**: Ayetler, Hadisler, Soru-Cevap, Tartışma ve Bilgi Paylaşımı başlıkları.
- **Gelişmiş Yorum Sistemi**: Reddit benzeri bir yapı ile forum gönderilerine ve yorumlara yanıt verilebilir.
- **Etkileşim Bildirimleri**:
  - "Yorumuna yanıt geldi"
  - "Gönderin beğenildi"
  - "Bahsedildiğin bir konu var"

### 3. İbadet Asistanı
Günlük dini vecibelerin takibini kolaylaştıran araçlar seti.

- **Gelişmiş Namaz Vakitleri**:
  - **Kaynak**: `vakit.vercel.app` servisi üzerinden Diyanet uyumlu veriler.
  - **Akıllı Önbellek (Caching)**: Şehir aramaları 24 saat, vakit verileri 1 saat sunucu tarafında önbelleklenir (Next.js Revalidation).
  - **Geri Sayım Sayacı**: Bir sonraki vakte kalan süreyi saniye bazlı gösterir. Kerahat vakitlerinde özel uyarı verir.
- **Kuran Radyo**:
  - `Icecast/Shoutcast` protokollerini destekleyen, düşük gecikmeli canlı yayın oynatıcı.
  - Spectrum Analyzer görselleştirmesi (Canvas API ile ses dalgalarını görselleştirme).

### 4. Oyunlaştırma (Gamification)
Düzenli kullanımı teşvik eden psikolojik motivasyon sistemi.

- **Streak (Zincir) Algoritması**:
  - Kullanıcının her gün en az 1 ayet okuması gerekir.
  - Eğer bir gün kaçırılırsa "Freeze" (Dondurma) hakkı varsa zincir kopmaz.
  - Freeze hakları, düzenli okuma yapılarak kazanılan "Coin"ler ile marketten alınabilir.
- **Rozet Sistemi**: Belirli başarılara (İlk Hatim, 30 Günlük Seri vb.) ulaşıldığında kazanılan dijital rozetler.

### 5. Platform Analitiği (Nabız)
`src/app/analizler` altında bulunan bu modül, platformun genel kullanım verilerini görselleştirir.

- **Global İstatistikler**: Toplam üye, günlük aktif kullanıcı, toplam okunma sayısı.
- **Trend Grafikleri**:
  - `BarChart`: Son 14 günlük ziyaretçi trendi.
  - `PieChart`: İçerik dağılımı (Yorum vs. Gönderi).
- **Popüler İçerik**: En çok ziyaret edilen sureler ve forum başlıkları.

### 6. Bildirim (Push Notification) Altyapısı
Uygulama kapalıyken bile kullanıcıya ulaşabilen sistem.

- **Web Push Protocol**: VAPID (Voluntary Application Server Identification) anahtarları ile imzalanmış güvenli payload gönderimi.
- **Service Worker**: Arka planda gelen push olaylarını yakalar ve işletim sistemi bildirimine dönüştürür.
- **Yönetim Paneli**: Kullanıcılar `/ayarlar` sayfasından bildirim türlerini (Namaz, Okuma, Sosyal) tek tek özelleştirebilir.

---

## 🏗 Teknik Mimari ve Altyapı

Proje, performans ve ölçeklenebilirlik odaklı "Modern stack" üzerine kuruludur.

### Frontend (İstemci)
- **Framework**: [Next.js 14.2](https://nextjs.org/) (App Router mimarisi).
- **Dil**: TypeScript (Strict mode açık).
- **State Management**: React Hooks (`useState`, `useContext`) ve URL state senkronizasyonu.
- **Styling**: Tailwind CSS + `clsx` + `tailwind-merge` paketi ile dinamik sınıflar.
- **Fonts**: `next/font` ile optimize edilmiş Google Fonts (Inter ve Amiri).
- **Icons**: `lucide-react` kütüphanesi.

### Backend (Sunucu & API)
- **Runtime**: Next.js Server Actions ve Route Handlers (Edge uyumlu).
- **Veritabanı**: Supabase (PostgreSQL 15+).
- **Authentication**: Clerk (JWT tabanlı, session yönetimi).
- **ORM**: Doğrudan Supabase JS Client (Type-safe query builder).

### Güvenlik
- **RLS (Row Level Security)**: Veritabanı seviyesinde erişim kontrolü. Her sorgu, kullanıcının `auth.uid()` değerine göre filtrelenir.
- **XSS & CSRF**: Next.js'in yerleşik korumaları aktiftir.

### Performans Optimizasyonları
- **Image Optimization**: `next/image` ile otomatik format dönüşümü (WebP/AVIF).
- **Code Splitting**: Sayfa bazlı otomatik JS bölme.
- **PWA Caching**: Service Worker ile statik varlıkların (CSS, JS, Font) önbelleklenmesi.

---

## 🗄 Veritabanı Şeması

Aşağıdaki şema, uygulamanın veri modelini özetler. Tüm tablolar `public` şemasındadır ve Supabase üzerinde barındırılır.

| Tablo | Açıklama |
|-------|----------|
| `profiles` | Kullanıcı profilleri (Puan, Streak, Şehir, Bildirim Ayarı). Clerk ID ile eşleşir. |
| `comments` | Kuran ayetlerine yapılan yorumlar. Recursive `parent_id` ile yanıtları destekler. |
| `forum_posts` | Forum gönderileri. Başlık, içerik ve kategori barındırır. |
| `forum_comments` | Forum gönderilerine yapılan yorumlar. |
| `post_likes` | Forum gönderi beğenileri (Çoklu beğeniyi önler). |
| `comment_likes` | Yorum beğenileri. |
| `push_subscriptions` | Kullanıcıların tarayıcı push abonelik bilgileri (Endpoint, Keys). |
| `notifications` | Uygulama içi bildirim geçmişi. Okundu/Okunmadı durumu. |

**Stored Procedures (Fonksiyonlar)**:
- `toggle_post_like`: Atomik beğeni işlemi (Ekle/Çıkar).
- `toggle_comment_like`: Yorumlar için atomik beğeni.

---

## 🔌 API Dokümantasyonu

Uygulamanın iç (Internal) API rotaları `src/app/api` altındadır. Authentication kontrolü için Clerk session kullanılır.

### Kuran Verisi
- `GET /api/sure`: Tüm sure listesi.
- `GET /api/sure/[id]`: Tekil sure detayları ve ayetleri.
- `GET /api/ayet/[id]`: Tekil ayet detayları.

### Kullanıcı İşlemleri
- `GET/POST /api/user/bookmark`: Yer imi yönetimi.
- `GET /api/user/comment`: Kullanıcının yorum geçmişi.

### Arama ve Keşif
- `GET /api/search`: Platform genelinde (Sure, Ayet, Forum) arama yapar.

### Sistem
- `POST /api/push/subscribe`: Push aboneliği oluşturur.
- `POST /api/notifications/send`: Programatik bildirim gönderimi.
- `GET /api/pray-times`: Vakit hesaplama proxy'si.

---

## 📱 Mobil ve PWA Özellikleri

### Progressive Web App (PWA)
Uygulama, `@ducanh2912/next-pwa` ile tam uyumlu bir PWA'dır.
- **Installability**: `src/hooks/usePWAInstall.ts` kancası, tarayıcının `beforeinstallprompt` olayını yakalar ve özel bir kurulum butonu sunar.
- **Offline Support**: İnternet kesintisi durumunda `/offline` sayfası devreye girer. Önceden yüklenen sayfalar cache'den çalışmaya devam eder.
- **Manifest**: Dinamik manifest dosyası, cihaz ana ekranında uygulama gibi görünmesini sağlar.

### Mobil UI
- Responsive grid yapıları (`grid-cols-1 md:grid-cols-3`).

### Native Mobil Uygulama (Expo)
Platformun ayrıca bir adet gelişmiş yerel mobil uygulaması bulunmaktadır (`/mobile` dizini).
- **WebView Mimarsisi**: Web sitesini (`kuran.yasireymen.com`) yerel bir uygulama performansıyla sunan gelişmiş WebView yapısı.
- **Gelişmiş Çevrimdışı Destek**: İnternet bağlantısı koptuğunda kullanıcıyı karşılayan özel "İnternet Yok" ekranı ve yeniden bağlanma mekanizması.
- **Native Branding**: Web (PWA) ile senkronize logolar, açılış ekranları (splash) ve koyu tema desteği.
- **Esnek Altyapı**: Expo SDK 54 tabanlı, `react-native-webview` ve `expo-network` ile güçlendirilmiş yapı.

---

## 🧩 Özel Bileşenler ve Kancalar (Hooks)

### Bileşenler (`src/components`)
- `Navbar`: Responsive üst menü. Mobilde hamburger menü, desktopta tam menü.
- `QuranRadio`: Canlı yayın oynatıcı.
- `charts/BarChart`, `charts/PieChart`: Recharts tabanlı veri görselleştirme bileşenleri.
- `auth/AuthCard`: Clerk formları için stilize edilmiş kapsayıcı.

### Kancalar (`src/hooks`)
- `usePWAInstall`: PWA kurulum durumunu yönetir.
- `usePageTracking`: Görüntülenen sayfaları analitik servisine (Supabase) kaydeder.

---

## ⚙️ Kurulum ve Geliştirme

### Gereksinimler
- Node.js 18.17.0 veya üzeri
- npm veya yarn
- Git

### Adımlar

1. **Repoyu Klonlayın**
   ```bash
   git clone https://github.com/kullaniciadi/quran.git
   cd quran
   ```

2. **Bağımlılıkları Yükleyin**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenleri Ayarlayın**
   `.env.local` dosyasını oluşturun:
   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...

   # Web Push (VAPID)
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:admin@example.com
   ```

4. **Veritabanını Hazırlayın**
   `supabase_schema.sql` dosyasını Supabase SQL Editöründe çalıştırın.

5. **Başlatın**
   ```bash
   npm run dev
   ```

---

## 🚀 Dağıtım (Deployment)

1. Vercel'de yeni proje oluşturun.
2. GitHub reponuzu bağlayın.
3. Environment Variables bölümüne `.env.local` içeriğini girin.
4. Build komutu: `next build` olarak kalmalıdır.
5. Deploy edin.

---

## 📝 Lisans Bilgisi

Bu proje **GNU General Public License v3.0 (GPLv3)** altında lisanslanmıştır.

### GPLv3 Temel Haklar ve Yükümlülükler
- **Özgürlük**: Yazılımı dilediğiniz amaçla kullanabilirsiniz.
- **Erişim**: Kaynak koduna erişim hakkınız vardır.
- **Değişiklik**: Kodu ihtiyaçlarınıza göre değiştirebilirsiniz.
- **Dağıtım**: Orijinal veya değiştirilmiş kopyaları dağıtabilirsiniz.
- **Copyleft**: **(ÖNEMLİ)** Eğer bu yazılımı değiştirip dağıtırsanız, kaynak kodunuzu da aynı lisans (GPLv3) altında, erişilebilir şekilde yayınlamanız zorunludur. Projeyi kapatıp (closed source) dağıtamazsınız.

Tam lisans metni için lütfen `LICENSE` dosyasını inceleyiniz.
