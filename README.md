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

## Geliştirme ortamını kurma

Gereksinimler: Node.js, pnpm, çalışan yerel PostgreSQL sunucusu, TMDB API anahtarı ve Google OAuth Web istemcisi bilgileri.

```bash
git clone https://github.com/Zyqwax/W2W.git
cd W2W
pnpm install
cp .env.example .env.local
```

Önce mevcut yerel PostgreSQL sunucunda boş bir `w2w` veritabanı oluştur (`createdb w2w`). `.env.local` içindeki `DATABASE_URL` değerini o sunucunun rol/parola/port ayarlarına göre düzenle. Unix socket ve peer authentication kullanıyorsan örnek biçim: `postgresql://zyqwax@localhost/w2w?host=/run/postgresql`. TMDB ve Google OAuth değerlerini de doldur. Better Auth için rastgele bir `BETTER_AUTH_SECRET` üret (ör. `openssl rand -base64 32`). Google OAuth istemcisinin yönlendirme adresi `http://localhost:3000/api/auth/callback/google` olmalı.

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
DATABASE_URL=postgres://YOUR_POSTGRES_USER:YOUR_POSTGRES_PASSWORD@localhost:5432/w2w
BETTER_AUTH_SECRET=replace_with_a_random_secret_at_least_32_characters
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

Boş veritabanı şemasını oluştur:

```bash
pnpm db:migrate
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
