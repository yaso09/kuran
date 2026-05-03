# Kur'an-ı Kerîm Okuma ve Araştırma Uygulaması

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D%2014-green.svg)
![Python Version](https://img.shields.io/badge/python-%3E%3D%203.8-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web%20|%20Windows%20|%20Android%20|%20iOS-lightgrey.svg)

Bu proje; Kur'an-ı Kerim'i orijinal Mushaf düzeninde okumak, kelime anlamlarını incelemek, farklı meal ve tefsirler arasında karşılaştırma yapmak ve Risale-i Nur dersleri ile entegre bir araştırma deneyimi sunmak amacıyla geliştirilmiş çok platformlu bir ekosistemdir.

---

## 📖 Masaüstü, Web ve Mobil Deneyimi

Uygulama, modern web teknolojileri (HTML5, Vanilla JS, CSS3) üzerine inşa edilmiş olup, her platformun kendine özgü avantajlarını kullanır:

- **Web**: Herhangi bir tarayıcı üzerinden hızlı erişim.
- **Masaüstü (Windows)**: `pywebview` ile yerel dosya sistemi erişimi, otomatik güncelleme ve CLI araçları.
- **Mobil (Android/iOS)**: `Cordova` altyapısı ile çevrimdışı kullanım ve mobil dosya yönetimi.

---

## ✨ Temel Özellikler

### 1. Zengin Okuma Modları
*   **Mushaf Görünümü**: Shaikh Hamdullah Mushaf hattı ile sayfa sayfa okuma.
*   **Ayet Listesi**: Klasik liste görünümü ile meal ve tefsire hızlı geçiş.
*   **Kelime Meali**: Her Arapça kelimenin üzerine gelindiğinde (veya tıklandığında) o kelimeye özel anlam gösterimi.

### 2. Araştırma ve Tefsir
*   **Karşılaştırmalı Meal**: Diyanet, Öztürk ve sisteme eklenen diğer tüm mealler arasında anlık geçiş.
*   **Gelişmiş Tefsir Sistemi**: Ayet detay sayfasında farklı müfessirlerin yorumlarını inceleme.
*   **Arama Motoru**: Hem Arapça metin hem de Türkçe mealler içinde yüksek performanslı kelime/ayet araması.

### 3. Multimedya ve Ses
*   **Hafız Seçimi**: Farklı kâri'lerden ayet bazlı veya sure bazlı dinleme.
*   **Senkronize Takip**: Okunan ayetin görsel olarak vurgulanması.

### 4. Risale-i Nur Entegrasyonu
*   Kur'an ayetleri ile Risale-i Nur bölümleri arasında tematik bağlar.
*   Külliyat içerisinde hızlı gezinti ve ayet referanslarına doğrudan erişim.

### 5. Namaz Vakitleri
*   Konum tabanlı veya şehir seçmeli hassas namaz vakti hesaplama.
*   Kalan süre gösterimi ve günlük vakit çizelgesi.

---

## 🛠️ Mimari ve Proje Yapısı

```text
kuran/
├── www/                # Frontend (HTML, JS, CSS ve Veri Dosyaları)
│   ├── app.js          # Çekirdek uygulama mantığı ve state yönetimi
│   ├── adhan.js        # Ezan vakitleri hesaplama motoru
│   ├── sureler/        # Ayet ve meal JSON verileri
│   ├── tefsirler/      # Tefsir içerikleri (HTML ve JSON)
│   └── risaleinur/     # Risale-i Nur kitapları ve indeksi
├── desktop/            # Masaüstü (Python) bileşenleri
│   ├── main.py         # PyWebView giriş noktası ve CLI motoru
│   ├── fileManager.py  # Yerel içerik yönetim sunucusu (Port 8081+)
│   └── extract*.py     # Veri dönüştürme ve işleme betikleri
├── mobile/             # Cordova mobil proje klasörü
├── build_*.js          # Derleme ve paketleme senaryoları
└── package.json        # Proje bağımlılıkları ve scriptler
```

---

## ⚙️ İçerik Yönetim Sistemi (Gelişmiş)

Uygulama, dışarıdan içerik eklemeye son derece açıktır. **Ayarlar** menüsü üzerinden:
- **Özel Yükleme**: `.meal`, `.kiraat` veya `.tefsir` uzantılı dosyalarınızı uygulamaya yükleyebilirsiniz.
- **Depo Sistemi**: GitHub depolarını (örn. `yaso09/kuran`) ekleyerek topluluk tarafından paylaşılan yeni içerikleri doğrudan indirebilirsiniz.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Bağımlılıklar
*   **Node.js v14+**
*   **Python 3.8+** (ve `pip`)

### 2. Başlatma
```bash
# Bağımlılıkları yükle
npm install
npm run install:python

# Web sunucusunu başlat (Tarayıcı için)
npm run dev

# Masaüstü uygulamasını başlat (Geliştirme modu)
npm run dev:desktop
```

---

## 💻 CLI (Komut Satırı) Kullanımı

Masaüstü sürümü, terminal üzerinden güçlü bir sorgu mekanizması sunar:

| Parametre | Açıklama | Örnek |
| :--- | :--- | :--- |
| `-s, --sure` | Sure numarası (1-114) | `-s 2` |
| `-a, --ayet` | Ayet no veya aralığı | `-a 255` veya `-a 1-5` |
| `-m, --meal` | Meal kaynağı | `-m diyanet` |
| `-t, --tefsir`| Tefsir kaynağı | `-t beydavi` |
| `-k, --kelime`| Kelime anlamlarını göster| `-k` |
| `-d, --dinle` | Sesi oynat | `-d` |
| `-j, --json`  | Çıktıyı JSON formatında ver| `-j` |
| `-l, --liste` | Meal/Tefsir listesini gör| `--liste` |

**Örnek Komut:**
```bash
python desktop/main.py -s 1 -a 1-7 -m diyanet -k
```

---

## 🏗️ Build ve Paketleme

### Windows (EXE)
`PyInstaller` ve `Inno Setup` kullanılarak taşınabilir veya kurulum dosyası oluşturulur:
```bash
npm run build:desktop
```

### Mobil (APK/IPA)
Cordova aracılığıyla derlenir:
```bash
npm run build:mobile
```

---

## 📄 Lisans ve Katkı

Bu proje **GPL-3.0** lisansı altındadır.
- **Hata Bildirimi**: Lütfen GitHub Issues kısmını kullanın.
- **Katkıda Bulunma**: Yeni meal veya tefsir verileri eklemek için `desktop/extract*.py` araçlarını inceleyebilir veya doğrudan PR gönderebilirsiniz.

**Yazar**: Yasir Eymen Kayabaşı ([@yaso09](https://github.com/yaso09))
