# 🎬 Seyir

**Seyir**, kullanıcıların TMDB (The Movie Database) üzerinden filmleri keşfetmesini, izleme listeleri (wishlist) ve özel listeler oluşturmasını, izleme geçmişini detaylı biçimde takip edip puanlamasını ve profillerini arkadaşlarıyla paylaşmasını sağlayan modern, mobil öncelikli bir **Next.js (App Router)** ve **Firebase Firestore** web/PWA uygulamasıdır.

---

## 🚀 Özellikler

- **🔍 Film Keşfi ve Arama:**
  - TMDB günlük trendler listesi.
  - Hızlı ve debounce destekli anlık film araması.
  - Film detay sayfası: Özet, türler, oyuncu kadrosu, YouTube fragmanı ve yaş/süre bilgileri.
  - Yerel yayın sağlayıcıları (Watch Providers: Netflix, Disney+, Prime Video vb. - bölgeye göre).

- **📋 Liste ve Kütüphane Yönetimi:**
  - **İzleme Listesi (Wishlist):** İzlenmek istenen filmleri hızlıca kaydetme.
  - **Özel Listeler:** İstenilen temada yeni listeler oluşturma, düzenleme ve ana sayfada sabitleme.
  - **Görünürlük Kontrolü:** Listeleri herkese açık (`public`) ya da gizli (`private`) olarak ayarlayabilme.

- **⏱️ İzleme Günlüğü (Watch Log):**
  - Filmleri anında, geçmiş bir tarihle veya tarihsiz olarak izlendi işaretleme.
  - Birden fazla kez izleme geçmişi (watch history timestamps) tutma.
  - 10 üzerinden kişisel puanlama ve yazılı yorum/inceleme ekleme.

- **👤 Profil ve Sosyal Etkileşim:**
  - Kullanıcı izleme istatistikleri, arşiv ve ortalama puan özeti.
  - Herkese açık kullanıcı profili (`/u/[id]`) ve profil bağlantısı paylaşımı.
  - Arkadaşlık sistemi ve arkadaşlara doğrudan film önerme.

- **🌐 Çoklu Dil ve Bölge Desteği:**
  - Dil seçenekleri: Türkçe (`tr-TR`) ve İngilizce (`en-US`).
  - Bölge seçenekleri: Türkiye (`TR`), ABD (`US`), İngiltere (`GB`), Almanya (`DE`).
  - Firestore üzerinde çok dilli film metadata ve sağlayıcı önbellekleme (`localizations/{locale}`).

- **📱 PWA & Mobil Öncelikli Tasarım:**
  - Mobil cihazlarda uygulama hissi veren Bottom Navigation ve Responsive tasarım.
  - Service Worker ile çevrimdışı önbellekleme ve PWA manifest (`standalone` mod).

---

## 🛠️ Teknoloji Yığını

- **Framework:** [Next.js](https://nextjs.org/) 16 (App Router)
- **Kütüphane:** [React](https://react.dev/) 19
- **Stil & Tasarım:** [Tailwind CSS](https://tailwindcss.com/) v4 & Lucide Icons
- **Veritabanı & Kimlik Doğrulama:** [Firebase](https://firebase.google.com/) Client SDK (Authentication & Cloud Firestore)
- **API Entegrasyonu:** [TMDB REST API](https://developer.themoviedb.org/)
- **Tarih & Zaman:** [Day.js](https://day.js.org/)
- **Paket Yöneticisi:** [pnpm](https://pnpm.io/)

---

## 📁 Proje Yapısı

```text
seyir-app/
├── public/                # PWA manifest, service worker (sw.js) ve statik varlıklar
├── src/
│   ├── app/               # Next.js App Router sayfaları ve layout
│   │   ├── layout.js      # Global layout ve Context sağlayıcıları
│   │   ├── page.js        # Ana kütüphane & dashboard
│   │   ├── login/         # Google Auth giriş sayfası
│   │   ├── search/        # TMDB arama & trendler
│   │   ├── movie/[id]/    # Film detay, izleme aksiyonları, yorum
│   │   ├── lists/         # Liste yönetimi ve [id] detay sayfası
│   │   ├── profile/       # Kullanıcı profili ve ayarlar
│   │   ├── u/[id]/        # Herkese açık kullanıcı profili
│   │   ├── messages/      # Sohbet ve öneri ekranları
│   │   └── refresh-cache/ # Film TMDB cache tazeleme aracı
│   ├── components/        # Yeniden kullanılabilir UI bileşenleri
│   │   ├── pages/         # Sayfalara özel görsel bileşenler
│   │   ├── ui/            # Buton, modal, kart gibi temel arayüz elemanları
│   │   ├── BottomNav.js   # Mobil alt bar ve masaüstü navigasyonu
│   │   └── ...
│   ├── context/           # AuthContext & AppDataContext (realtime Firestore dinleyicileri)
│   └── lib/               # Firebase istemcisi, TMDB istekleri, i18n ve yardımcı fonksiyonlar
└── PROJECT_OVERVIEW.md    # Geliştiriciler ve modeller için detaylı teknik harita
```

---

## ⚙️ Kurulum ve Başlangıç

### Ön Gereksinimler

- [Node.js](https://nodejs.org/) (v18.17 veya üzeri önerilir)
- [pnpm](https://pnpm.io/) (`npm i -g pnpm`)
- [TMDB API Anahtarı](https://developer.themoviedb.org/docs)
- [Firebase Projesi](https://console.firebase.google.com/) (Google Authentication ve Cloud Firestore aktif edilmiş)

### 1. Depoyu Klonlayın ve Bağımlılıkları Yükleyin

```bash
git clone https://github.com/kullanici-adi/seyir-app.git
cd seyir-app
pnpm install
```

### 2. Ortam Değişkenlerini Tanımlayın

`.env.example` dosyasını referans alarak kök dizinde `.env` (veya `.env.local`) oluşturun:

```bash
cp .env.example .env
```

Değişkenleri kendi anahtarlarınız ile doldurun:

```env
# TMDB API
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Firebase Client Yapılandırması
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

### 3. Uygulamayı Geliştirme Modunda Çalıştırın

```bash
pnpm dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

---

## 📜 Kullanılabilir Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Geliştirme sunucusunu başlatır (`localhost:3000`). |
| `pnpm build` | Üretim (production) derlemesini oluşturur. |
| `pnpm start` | Üretim derlemesini başlatır. |
| `pnpm lint` | ESLint ile kod kontrolü yapar. |
| `pnpm migrate:firestore:movies` | Film cache verilerini kontrol eder / günceller. |
| `pnpm migrate:firestore:lists` | Eski film modelini yeni list/watchLog modeline taşır. |

---

## 🗄️ Firestore Veri Modeli Özeti

Uygulama, Firestore üzerinde aşağıdaki koleksiyon ve alt koleksiyon yapısını kullanır:

- `users/{uid}`: Kullanıcı profili, tercih edilen dil ve bölge.
  - `lists/{listId}`: Varsayılan (`wishlist`, `watched`) ve özel listeler.
    - `movies/{movieId}`: Listeye eklenen filmler.
  - `watchLog/{movieId}`: İzlenme durumları, geçmiş zaman kayıtları, puan (`rating`) ve yorumlar (`review`).
  - `friends/{friendUid}`: Eklenen arkadaşlar.
- `movies/{movieId}`: TMDB'den çekilen filmlerin ortak cache verileri.
  - `localizations/{locale}`: Başlık, özet, fragman ve oyuncu bilgileri.
  - `providers/{region}`: Bölgesel izleme platformları (flatrate, rent, buy vb.).
- `chats/{chatId}`: Kullanıcılar arası mesajlaşma ve film tavsiyesi kayıtları.

---

## 📄 Lisans

Bu proje kişisel kullanım ve geliştirme amaçlı hazırlanmıştır.
