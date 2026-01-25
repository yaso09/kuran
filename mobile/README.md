# Kur'ancılar Mobil Uygulaması (Expo)

Bu dizin, Kur'ancılar platformunun yerel mobil uygulama (Native App) kaynak kodlarını içerir. Uygulama, Expo framework'ü kullanılarak geliştirilmiştir ve web sitesini gelişmiş bir `WebView` içerisinde sunar.

## ✨ Özellikler

- **Tam Uyumluluk:** Web sitesinin mobil görünümüyle %100 senkronize çalışma.
- **Çevrimdışı Destek:** İnternet bağlantısı kesildiğinde otomatik olarak devreye giren "İnternet Yok" ekranı ve tekrar dene mekanizması.
- **Platform Uyumluluğu:** Hem iOS hem de Android için optimize edilmiştir. Web tarayıcısı üzerinde çalıştırıldığında akıllı iframe mimarisine geçiş yapar.
- **Yerel Görünüm:** Özelleştirilmiş splash screen (açılış ekranı) ve uygulama ikonu.
- **Güvenli Alan Desteği:** Notch ve durum çubukları için Safe Area entegrasyonu.

## 🚀 Başlangıç

### Gereksinimler

- Node.js (v18+)
- npm veya yarn
- Mobile cihazda test etmek için **Expo Go** uygulaması

### Kurulum

1. Mobile dizinine gidin:
   ```bash
   cd mobile
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Uygulamayı başlatın:
   ```bash
   npx expo start
   ```

### Geliştirme Komutları

- `npm run android`: Android emülatörde başlatır.
- `npm run ios`: iOS simülatörde başlatır (macOS gereklidir).
- `npm run web`: Tarayıcı üzerinde test etmek için başlatır.

## 🛠 Teknik Mimari

- **Framework:** Expo SDK 54
- **Web Görüntüleme:** `react-native-webview`
- **Bağlantı Takibi:** `expo-network`
- **İkonlar:** `lucide-react-native`
- **Durum Çubuğu:** `expo-status-bar`

---
Kur'ancılar - Modern ve Sosyal Kur'an-ı Kerim Platformu
