# W2W — What to Watch

Bu dosya, projeye yeni katılan bir agent veya geliştirici için mevcut kaynak koddan çıkarılmış proje haritasıdır. Route, veri modeli ve davranış açıklamaları mevcut checkout'taki kodu yansıtır.

## 1. Projenin amacı

W2W; kullanıcıların TMDB üzerinden film keşfetmesini, filmleri izleme listesine eklemesini, izlediklerini ve izleme geçmişini kaydetmesini, puan/yorum vermesini, özel listeler oluşturmasını ve profilini paylaşmasını sağlayan mobil öncelikli bir Next.js uygulamasıdır.

Ana özellikler:

- Google ile Firebase Authentication giriş/çıkış.
- TMDB arama, günlük trend filmler ve film detayları.
- Wishlist, watched listesi ve izleme geçmişi.
- Film puanı ve kişisel yorum.
- Özel film listeleri; public/private görünürlük.
- Kullanıcı profili, arkadaşlık ve public profil.
- Film sağlayıcıları ve YouTube trailer bilgisi.
- Firebase Firestore realtime listener'ları.
- PWA manifest, service worker ve temel offline/cache davranışı.

## 2. Teknoloji yığını

- Next.js 16.2.4, App Router
- React 19.2.4
- JavaScript; TypeScript kullanılmıyor
- Tailwind CSS 4.3.3 ve PostCSS
- Firebase client SDK 10.14.1
  - Firebase Authentication
  - Cloud Firestore
- Firebase Admin SDK: yalnızca migration scriptlerinde
- TMDB REST API
- dayjs: tarih, locale ve relative time
- lucide-react: ikonlar
- ESLint 9 + eslint-config-next

Kaynak kodda Prisma schema'sı veya Prisma runtime kullanımı yoktur. Aktif veritabanı katmanı Firebase/Firestore'dur.

## 3. Sayfa route'ları

| Route | Auth | İçerik ve davranış |
|---|---:|---|
| / | Gerekli | Ana kütüphane. Wishlist ve watched sekmeleri, hero film, sıralama, film kartları ve özel liste içerikleri gösterilir. Oturum yoksa /login yönlendirmesi yapılır. |
| /login | Gerekmez | Google popup ile giriş ekranı. Oturum açılmışsa / adresine gider. |
| /search | Gerekli | TMDB günlük trend filmleri ve 800 ms debounce'lu film araması. Sonuçlar dil/bölgeye göre alınır; sessionStorage ile arama/trend cache'i tutulur. |
| /movie/[id] | Gerekli | Film detay sayfası. TMDB/Firestore cache, poster/backdrop, özet, oyuncular, trailer, sağlayıcılar, izleme aksiyonları, geçmiş, puan, yorum, özel listeye ekleme ve arkadaşa film önerme. |
| /lists | Gerekli | Kullanıcının listelerini yönetir. Varsayılan wishlist ve watched listelerini oluşturur; özel liste ekleme, yeniden adlandırma, public/private değiştirme ve detayına gitme desteklenir. |
| /lists/[id] | Gerekli | Bir listenin film grid'i. Liste metadata'sı, görünürlük, film sayısı ve film kartları gösterilir. Film metadata'sı TMDB/Firestore cache'ten lokalize edilir. |
| /profile | Gerekli | Kullanıcının kendi profili, izlenen/izlenecek arşivi, ortalama puanı, son izlenenler, dil/bölge tercihleri, profil paylaşımı ve logout. |
| /u/[id] | Gerekli | Başka kullanıcının public profili. Profil bilgisi, arkadaşlık durumu, izlenen/wishlist arşivi, public listeler ve arkadaş olarak ekleme/sohbet başlatma aksiyonları. Kullanıcı kendi UID'sini açarsa /profile adresine yönlendirilir. |
| /messages | Gerekli | Kaynakta chat listesi ve yeni sohbet logic'i var; fakat aktif render doğrudan ComingSoon döndürür. Kullanıcıya şu an gerçek mesaj listesi yerine yakında ekranı görünür. |
| /messages/[chatId] | Gerekli | Kaynakta realtime chat, mesaj gönderme ve film önerisi render logic'i var; fakat aktif render doğrudan ComingSoon döndürür. |
| /refresh-cache | Auth gate yok | Kök movies collection'ındaki tüm film ID'lerini alıp tüm tanımlı dillere göre TMDB cache'ini force refresh eder. Yönetim/operasyon aracıdır. |

### Route davranışıyla ilgili önemli notlar

- Sayfa dosyalarının tamamı client component olarak çalışır; Firestore ve TMDB istekleri tarayıcı tarafından yapılır.
- /messages ve /messages/[chatId] içindeki gerçek view return'leri mevcut ComingSoon return'ünün arkasında kaldığı için erişilemez durumdadır.
- /u/[id] eski users/{uid}/movies koleksiyonunu da okur. Ana uygulamanın güncel film akışı ise lists/wishlist + watchLog modelidir; bu iki akış tamamen aynı değildir.
- Route parametreleri Next.js'in güncel async params kullanımına uyumlu olarak use(params) veya use(params.props) ile unwrap edilir.

## 4. Global uygulama kabuğu

src/app/layout.js bütün sayfaları şu provider/shell sırasıyla sarar:

1. ServiceWorkerRegister: /sw.js kaydını yapar.
2. AuthProvider: Firebase auth state, kullanıcı profili, dil ve bölgeyi yönetir.
3. LanguageSync: html lang değerini günceller.
4. AppDataProvider: kullanıcının film, liste, watch log ve arkadaş realtime verilerini yükler.
5. NavigationProvider: desktop sidebar ve mobile menu state'i.
6. BottomNav: header, arama önerileri, sidebar ve ana navigasyon.
7. MainContentWrapper: login ve chat route'ları için full-screen layout davranışı.

Ana navigasyon linkleri:

- Ana Sayfa: /
- Keşfet: /search
- Listeler: /lists
- Mesajlar: /messages
- Profil: /profile

Header araması, TMDB search endpoint'inden ilk 5 öneriyi alır ve seçilen filmi /movie/{tmdbId} adresine açar.

## 5. Firestore veri modeli

Bu proje ilişkisel tablo değil, document/subcollection tabanlı Firestore kullanır. Aşağıdaki alanlar kaynakta aktif olarak okunur veya yazılır.

~~~text
users/{uid}
├── profile document fields
│   ├── uid
│   ├── displayName
│   ├── photoURL
│   ├── email
│   ├── lastSeen
│   ├── language       # tr veya en
│   └── region         # TR, US, GB veya DE
│
├── lists/{listId}
│   ├── id
│   ├── name
│   ├── type           # default veya custom
│   ├── visibility     # public veya private
│   ├── showOnHome
│   ├── createdAt
│   ├── updatedAt
│   ├── schemaVersion
│   └── movies/{movieId}
│       ├── movieId
│       ├── title
│       ├── posterPath
│       └── addedAt
│
├── watchLog/{movieId}
│   ├── movieId
│   ├── title
│   ├── posterPath
│   ├── status         # çoğunlukla watched
│   ├── isWatched
│   ├── addedAt
│   ├── watchedAt      # timestamp ms veya null
│   ├── watchHistory   # [{ ts: number|null }, ...]
│   ├── rating         # sayısal kişisel puan
│   ├── review
│   └── updatedAt      # migration ile yazılabilir
│
├── friends/{friendUid}
│   ├── uid
│   ├── displayName
│   ├── photoURL
│   └── addedAt
│
└── movies/{movieId}  # eski/legacy model; public profile ve migration kaynağı
    ├── title
    ├── posterPath
    ├── status
    ├── isWatched
    ├── addedAt
    ├── watchedAt
    ├── watchHistory
    ├── rating
    └── review

movies/{movieId}
├── id
├── originalTitle
├── originalLanguage
├── posterPath
├── backdropPath
├── releaseDate
├── runtime
├── voteAverage
├── voteCount
├── schemaVersion
├── updatedAt
├── localizations/{locale}
│   ├── locale
│   ├── title
│   ├── overview
│   ├── tagline
│   ├── genres          # string[]
│   ├── trailer         # YouTube video key veya null
│   └── cast            # ilk 5 oyuncu: name, character, profilePath
└── providers/{region}
    ├── region
    ├── link
    ├── flatrate[]
    ├── free[]
    ├── ads[]
    ├── rent[]
    └── buy[]

Her provider item'i: id, name, logoPath, priority.

chats/{chatId}
├── participants       # iki UID; chat ID: sıralanmış UID'ler joined with "_"
├── lastMessage
├── lastMessageAt
├── lastMessageSenderId
└── unreadBy           # UID array'i
    └── messages/{messageId}
        ├── senderId
        ├── text
        ├── type         # text veya movie_recommendation
        ├── createdAt
        ├── movieId       # film önerisinde
        ├── movieTitle    # film önerisinde
        └── moviePoster   # film önerisinde
~~~

### Varsayılan listeler

İlk authenticated data yüklemesinde ensureDefaultLists şu iki belgeyi merge ederek garanti eder:

~~~text
users/{uid}/lists/wishlist
  type: default, visibility: public, showOnHome: true

users/{uid}/lists/watched
  type: default, visibility: private, showOnHome: false
~~~

İzlenen film wishlist'ten otomatik silinmez. Güncel davranışta wishlist üyeliği ve watch log ayrı tutulur; ana sayfa wishlist içinden gelen filmleri watch log ile zenginleştirip isWatched hesaplar.

## 6. Veri akışları

### Auth ve profil

AuthProvider, onAuthStateChanged ile Firebase kullanıcısını dinler. Google popup login sonrası users/{uid} belgesini merge eder ve temel profil bilgilerini/lastSeen alanını günceller. Dil ve bölge tercihleri aynı profile document'ında tutulur.

### Film cache stratejisi

src/lib/tmdb.js içindeki fetchAndCacheMovie:

1. movies/{id} ve movies/{id}/localizations/{language} belgelerini paralel okur.
2. İkisi de varsa Firestore cache'ten döner.
3. Cache eksikse TMDB /movie/{id} endpoint'ine videos,credits ile gider.
4. Canonical ve localized belgeleri Firestore'a merge eder.
5. Hata halinde kök movie document'ındaki eski formatı fallback olarak dener.

fetchWatchProviders, movies/{id}/providers/{region} cache'ini kullanır ve eksikse TMDB watch-provider endpoint'ine gider.

### Ana uygulama data yükleme

AppDataProvider authenticated kullanıcı için realtime olarak şunları dinler:

- users/{uid}/lists/wishlist/movies
- users/{uid}/watchLog
- users/{uid}/lists
- Her custom listenin movies subcollection'ı
- users/{uid}/friends

Listeye kaydedilmiş film özetleri daha sonra TMDB/Firestore cache metadata'sı ile birleştirilir.

### Film aksiyonları

/movie/[id] üzerinden:

- Şimdi izledim, geçmiş tarih ile izledim veya tarih olmadan izledim kaydı yapılabilir.
- İzleme geçmişine yeni {ts} girdisi eklenir.
- Rating/review watchLog/{movieId} içine yazılır.
- Wishlist kaydı kaldırılabilir veya wishlist status'u korunabilir.
- Film custom listeye lists/{listId}/movies/{movieId} ile eklenebilir.
- Arkadaşa film önerisi, chats/{chatId}/messages altında movie_recommendation mesajı oluşturur.

## 7. Dış servisler ve environment değişkenleri

.env.example içindeki değişkenler:

~~~text
NEXT_PUBLIC_TMDB_API_KEY

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
~~~

- NEXT_PUBLIC_* Firebase değerleri browser client SDK için kullanılır.
- TMDB key mevcut implementasyonda NEXT_PUBLIC_TMDB_API_KEY olduğu için browser bundle'ına girer.
- FIREBASE_CLIENT_EMAIL ve FIREBASE_PRIVATE_KEY yalnızca Admin SDK migration scriptleri içindir; browser'a açılmamalıdır.
- next.config.mjs, image.tmdb.org ve Google user avatar hostlarını next/image için izinli remote pattern olarak tanımlar.

Dil/bölge:

- Varsayılan dil: tr; alternatif: en.
- Varsayılan bölge: TR; seçenekler: TR, US, GB, DE.
- TMDB locale değerleri: tr-TR ve en-US.

## 8. PWA ve cache

- public/manifest.json uygulamayı portrait standalone PWA olarak tanımlar.
- public/sw.js temel asset'leri cache'ler.
- TMDB API için network-first, TMDB görselleri için cache-first yaklaşımı vardır.
- Navigation request'leri network başarısız olursa / cache'ine düşer.
- Service worker kaydı src/components/ServiceWorkerRegister.js içinden yapılır.

## 9. Migration scriptleri

### Film cache migration

Komut:

~~~bash
pnpm migrate:firestore:movies
~~~

Script varsayılan olarak dry-run çalışır. movies root collection'ı ve collectionGroup("movies") üzerinden film ID'lerini toplar. Uygulama yazımı için:

~~~bash
pnpm migrate:firestore:movies --apply --project=<firebase-project-id>
~~~

--languages=tr-TR,en-US ve --regions=TR parametreleri desteklenir. --apply olmadan Firestore write yapılmaz; --project doğrulaması olmadan apply reddedilir. Mevcut user data silinmez.

### Eski user movie modelinden list modeline migration

Komut:

~~~bash
pnpm migrate:firestore:lists
~~~

Bu script eski users/{uid}/movies belgelerini wishlist, watched listesi ve watchLog belgelerine dönüştürür. Varsayılan dry-run'dır. Apply için:

~~~bash
pnpm migrate:firestore:lists --apply --project=<firebase-project-id>
~~~

Eski belgeler silinmez. Bu scriptin varlığı, migration'ın mutlaka çalıştırılmış veya production verisinin tamamının güncel olduğu anlamına gelmez.

## 10. Önemli mevcut durum ve teknik borçlar

- Gerçek Firestore security rules/indexes dosyaları checkout'ta görünmüyor. Agent yeni bir data akışı eklerken Firestore Rules tarafının ayrıca kontrol edilmesi gerekir.
- Mesaj route'larında Firestore realtime logic'i mevcut olsa da iki route da aktif olarak ComingSoon render eder.
- Public profile hâlâ legacy users/{uid}/movies collection'ını okuyor; ana profil/home akışı yeni list + watchLog modelini kullanıyor. Public profile migration sonrası ayrıca doğrulanmalı.
- /refresh-cache sayfasında route-level auth kontrolü yoktur. Firestore root movie belgelerine ve TMDB'e yazma yaptığı için operasyonel/admin kullanım olarak ele alınmalıdır.
- Uygulamada Next.js API route veya server action katmanı bulunmuyor; Firebase ve TMDB çağrıları client tarafında.
- README.md hâlâ create-next-app başlangıç metnidir; bu dosya gerçek uygulama davranışının daha doğru özetidir.
- Firestore timestamp alanları ile client-side Date.now() alanları birlikte kullanılır; yeni alan eklerken bu ayrım korunmalıdır.

## 11. Agent için önerilen başlangıç noktaları

Bir özellik geliştirirken şu sırayla bakılabilir:

1. Route controller: ilgili src/app/**/page.js.
2. Görsel/presentation component: src/components/pages/<feature>/.
3. Global auth/data: src/context/AuthContext.js ve src/context/AppDataContext.js.
4. Firestore helper: src/lib/user-lists.js veya src/lib/firebase.js.
5. Film metadata/cache: src/lib/tmdb.js.
6. Metin ve dil: src/lib/i18n.js.
7. Global shell: src/app/layout.js, src/components/BottomNav.js, src/components/MainContentWrapper.js.

Mevcut component düzeninde route dosyaları çoğunlukla controller/state/data erişimini, src/components/pages altındaki dosyalar ise presentation UI'ını taşır. Yeni bir akış eklerken bu ayrım ve mevcut Firestore path'leri korunmalıdır.

## 12. Çalıştırma ve kontrol komutları

~~~bash
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm start
~~~

Varsayılan local adres: http://localhost:3000.

Çalıştırmadan önce .env.example değerleriyle .env oluşturulmalı; özellikle Firebase client config ve TMDB key olmadan login/cache özellikleri çalışmaz.

