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
- [Better Auth](https://www.better-auth.com/) ile Google OAuth
- Yerel PostgreSQL ve [Drizzle ORM](https://orm.drizzle.team/)
- [TMDB API](https://developer.themoviedb.org/)
- [pnpm](https://pnpm.io/)

## Docker ile çalıştırma

Gereksinimler: Docker Compose, TMDB API anahtarı ve Google OAuth Web istemcisi bilgileri.

```bash
git clone https://github.com/Zyqwax/W2W.git
cd W2W
cp .env.example .env
```

`.env` dosyasına TMDB ve Google OAuth değerlerini yaz. Better Auth secret'ını üretip `.env` dosyasına ekle:

```bash
openssl rand -base64 32
```

Google OAuth istemcisinin yönlendirme adresi `http://localhost:3000/api/auth/callback/google` olmalı. Uygulama ve PostgreSQL'i başlat:

```bash
docker compose up --build
```

Compose, `db` servisi sağlıklı olduktan sonra Drizzle migration'larını uygular ve uygulamayı başlatır. Uygulama [http://localhost:3000](http://localhost:3000) adresinde, PostgreSQL ise host makinede `localhost:5433` portunda kullanılabilir. Uygulama konteynerinin `DATABASE_URL` değeri Compose tarafından `postgresql://w2w:w2w_dev_password@db:5432/w2w` olarak ayarlanır; host üzerinde `pnpm dev` veya Drizzle komutları çalıştırırken `.env` içindeki `DATABASE_URL` kullanılır.

`.env` içindeki `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` ve `APP_PORT` değerleri Docker servislerini yapılandırır. Veritabanı verisi `postgres_data` adlı kalıcı Docker volume'ünde tutulur. Tamamen yeni ve boş bir veritabanıyla başlamak istersen `docker compose down -v` komutu bu volume'ü ve içindeki verileri siler.

`NEXT_PUBLIC_TMDB_API_KEY` Next.js istemci koduna build sırasında eklendiğinden bu anahtarı değiştirdikten sonra `docker compose up --build` ile imajı yeniden oluştur.

Dizi verileri sunucu üzerinden TMDB'den alınır. Bunun için isteğe bağlı `TMDB_API_KEY` sunucu ortam değişkenini kullanabilirsin; tanımlanmazsa mevcut `NEXT_PUBLIC_TMDB_API_KEY` kullanılır. Dizi takibi tabloları için uygulama güncellemesinden önce `pnpm db:migrate` çalıştır; Compose kurulumunda migration servisi bunu uygulama başlamadan yapar.

## Host üzerinde geliştirme

Docker PostgreSQL'ini tek başına başlat:

```bash
docker compose up -d db
```

`.env` içindeki host bağlantı URL'si `postgresql://w2w:w2w_dev_password@localhost:5433/w2w` olarak ayarlanmıştır. Migration'ları uygula ve geliştirme sunucusunu başlat:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `pnpm dev` | Geliştirme sunucusunu başlatır. |
| `pnpm build` | Üretim derlemesini oluşturur. |
| `pnpm start` | Üretim sunucusunu başlatır. |
| `pnpm lint` | ESLint kontrollerini çalıştırır. |
| `pnpm db:generate` | Drizzle şemasından yeni PostgreSQL migration'ı üretir. |
| `pnpm db:migrate` | Bekleyen migration'ları yerel PostgreSQL'e uygular. |

## Proje yapısı

```text
public/                 Statik dosyalar, PWA manifesti ve service worker
src/app/                Next.js sayfaları ve yönlendirmeler
src/components/         Uygulama kabuğu ve tekrar kullanılabilir arayüzler
src/components/pages/   Sayfalara özel bileşenler
src/context/            Better Auth oturumu ve uygulama verileri
src/lib/                PostgreSQL/Drizzle, veri API istemcisi, TMDB ve liste yardımcıları
src/app/api/            Better Auth ve uygulama veri Route Handler'ları
drizzle/                PostgreSQL migration dosyaları
```

## Veri ve servisler

Kimlik ve oturum kayıtları PostgreSQL'de Better Auth tablolarında tutulur. Uygulama profilleri, listeler, izleme kayıtları, arkadaşlar, sohbetler ve TMDB önbelleği aynı yerel PostgreSQL veritabanındaki JSONB belge tablosuna kaydedilir; erişim `/api/data` Route Handler'ında oturuma göre denetlenir. Bu geliştirme kurulumu boş veritabanıyla başlar; eski Firebase verisi içe aktarılmaz. `.env.local` dosyasını depoya ekleme.

Film bilgileri [TMDB](https://www.themoviedb.org/) tarafından sağlanır. W2W, TMDB tarafından onaylanmamış veya desteklenmemiştir.
