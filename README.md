# W2W — What to Watch

W2W, izlemek istediğin ve izlediğin filmleri düzenlemene yardımcı olan koyu temalı bir film takip uygulamasıdır. TMDB ile film keşfedebilir, listeler oluşturabilir, izleme geçmişini ve kişisel puanlarını kaydedebilir, herkese açık film koleksiyonlarını paylaşabilirsin.

**GitHub:** [github.com/Zyqwax/W2W](https://github.com/Zyqwax/W2W)

## Özellikler

- TMDB trendlerinde ve tür ya da yıla göre film keşfi; başlığa göre arama.
- İzleme listesi, izlenenler arşivi ve özel film listeleri. Listeler herkese açık veya gizli olabilir.
- İzlenme durumu, izleme tarihleri, kişisel puan ve notlar.
- Film ayrıntıları: özet, oyuncular, fragman ve bölgeye göre izleme seçenekleri.
- Profil istatistikleri, arkadaşlar ve herkese açık kullanıcı profilleri.
- Türkçe ve İngilizce arayüz; Türkiye, ABD, Birleşik Krallık ve Almanya bölge tercihleri.
- Mobil ve masaüstü uyumlu tasarım, kurulabilir PWA.

> Mesajlaşma alanı şu anda hazırlık ekranı gösteriyor; sohbet özellikleri henüz kullanıma açık değil.

## Teknolojiler

- [Next.js](https://nextjs.org/) 16 ve [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com/) 4 ve Lucide ikonları
- [Firebase](https://firebase.google.com/) Authentication ve Cloud Firestore
- [TMDB API](https://developer.themoviedb.org/)
- [pnpm](https://pnpm.io/)

## Geliştirme ortamını kurma

Gereksinimler: Node.js ve pnpm, bir TMDB API anahtarı ve Google Authentication ile Cloud Firestore etkinleştirilmiş bir Firebase projesi.

```bash
git clone https://github.com/Zyqwax/W2W.git
cd W2W
pnpm install
cp .env.example .env.local
```

`.env.local` dosyasındaki TMDB ve Firebase değerlerini kendi projenin bilgileriyle doldur:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

Geliştirme sunucusunu başlat:

```bash
pnpm dev
```

Uygulama varsayılan olarak [http://localhost:3000](http://localhost:3000) adresinde açılır.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | Geliştirme sunucusunu başlatır. |
| `pnpm build` | Üretim derlemesini oluşturur. |
| `pnpm start` | Üretim sunucusunu başlatır. |
| `pnpm lint` | ESLint kontrollerini çalıştırır. |

## Proje yapısı

```text
public/                 Statik dosyalar, PWA manifesti ve service worker
src/app/                Next.js sayfaları ve yönlendirmeler
src/components/         Uygulama kabuğu ve tekrar kullanılabilir arayüzler
src/components/pages/   Sayfalara özel bileşenler
src/context/            Kimlik doğrulama ve Firestore uygulama verileri
src/lib/                Firebase, TMDB, çeviri ve liste yardımcıları
```

## Veri ve servisler

Kullanıcı verileri Cloud Firestore’da tutulur. Kullanıcı belgelerinin altında profiller, tercihler, listeler, liste filmleri ve izleme günlükleri bulunur; TMDB film bilgileri ortak önbellekten sağlanır. Firebase ve TMDB anahtarlarını depoya ekleme; yerel geliştirme için `.env.local` kullan.

Film bilgileri [TMDB](https://www.themoviedb.org/) tarafından sağlanır. W2W, TMDB tarafından onaylanmamış veya desteklenmemiştir.
