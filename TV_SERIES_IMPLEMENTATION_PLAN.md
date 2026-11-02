# Dizi Takibi — Uygulama Planı

## Amaç ve ürün kararları

W2W'ye film deneyimini bozmadan dizi keşfi ve bölüm takibi eklenir.

- **Diziler ayrı bir ana içerik alanıdır.** Ana navigasyonda Filmler ve Diziler ayrı girişler olur; dizi kartları film ızgaralarına kendiliğinden karışmaz.
- **Wishlist ve izlenen arşivi tür bazında ayrılır.** Her iki alanda Filmler / Diziler sekmeleri bulunur. Diziler sekmesinde durum ve bölüm ilerlemesi gösterilir.
- **Özel listeler karışık olabilir.** Kullanıcı aynı özel listeye film ve dizi ekleyebilir. Kartlarda tür rozeti olur; liste öğesinin kimliği içerik türü + TMDB ID'sidir.
- **Dizi izleme durumu ayrı kavramdır.** Dizi genel durumu `watchlist`, `watching`, `completed`, `on_hold`, `dropped` veya `planned` olabilir. Bölüm görülme işaretleri asıl ilerleme kaynağıdır; toplam dizi durumu bunlardan türetilir veya kullanıcı tarafından tamamlandı/bırakıldı olarak değiştirilebilir.
- **Bölüm izleme geri alınabilir.** Tek bölüm işaretleme ve sezon içindeki tüm bölümleri işaretleme desteklenir. İlerleme geri alınırsa son izlenen bölüm de yeniden hesaplanır.

## Mevcut mimariden çıkan kısıtlar

- Uygulama Next.js `16.4.2`, App Router, React ve TypeScript kullanıyor. Route parametreleri ve server/client sınırları güncel Next.js rehberine göre uygulanmalı.
- TMDB için film arama/cache katmanı `src/lib/tmdb.ts` içinde. Katalog `movies`, yerelleştirmeler `movie_localizations` tablosunda tutuluyor.
- Kullanıcı verilerinin aktif yolu `src/app/api/data/route.ts` üzerinden Firestore benzeri belge yollarını PostgreSQL'e çeviriyor. `AppDataContext` realtime listener sözleşmesini taklit eden bu istemci katmanına bağlı.
- Eski dokümantasyondaki Firebase/Firestore tanımları güncel değil. Uygulama değişikliği ilişkisel Drizzle şeması ve API adaptörü üzerinden yapılmalı.
- `lists`/`list_movies`, `wishlist` ve `watch_logs` yalnızca film tablolarına bağlı. `list_movies.movie_id → movies.id` ilişkisini tür filtresi olmadan yeniden kullanmak mümkün değil.
- Çalışma ağacında önceden var olan `scripts/transfer-user-lists.mjs` değişikliği bu plan kapsamında değildir; korunmalıdır.

## Bilgi sağlayıcısı ve veri kullanımı

### Tercih: TMDB

Mevcut uygulamanın film kataloğu TMDB olduğundan diziler için aynı sağlayıcıyı kullanmak arama, görsel, dil, puan ve kredi deneyimini tutarlı kılar. Kullanılacak uçlar:

- `GET /3/search/tv` — dizi arama
- `GET /3/tv/{series_id}` — temel bilgiler, durum, sezon sayısı, bölüm sayısı, ilk/son yayın tarihi
- `GET /3/tv/{series_id}/season/{season_number}` — sezon ve bölüm listesi
- Gerekirse `GET /3/tv/{series_id}/watch/providers` — yayın sağlayıcıları

TMDB uygulama kimlik bilgisi sunucu tarafında tutulmalı; mevcut `NEXT_PUBLIC_TMDB_API_KEY` kullanımı incelenip mümkünse anahtarın istemciye açılması kaldırılmalı. TMDB kaynak atfı/bağlantısı uygulamada görünür olmalı ve ticari kullanım/lisans şartları yayına çıkmadan doğrulanmalı. TMDB puanı kullanıcı puanı gibi sunulmamalı.

### Cache davranışı

- Katalog ve yerelleştirilmiş detaylar PostgreSQL'de saklanır; TMDB çağrıları sunucu tarafı Route Handler/helper içinden geçer.
- Dizi ayrıntısı ve sezon verisi cache'ten okunur, eksik veya eskimişse TMDB'den yenilenir.
- Kullanıcının sezon/bölüm listesini açmadığı diziler için bütün sezonları peşinen çekme. Dizi detayında sezon özeti, sezona girince ilgili sezonun bölümleri yüklenir.
- API hatası olduğunda cache varsa göster; yoksa anlaşılır hata ve yeniden deneme olanağı ver.

## Veri modeli önerisi

Film tablolarını diziye göre nullable alanlarla şişirmek yerine ayrı katalog tabloları ve ortak tür anahtarlı kullanıcı listesi öğeleri kullanılır.

### Katalog tabloları

| Tablo | Ana alanlar | Anahtar |
|---|---|---|
| `tv_series` | `id` (TMDB), `original_name`, `original_language`, `poster_path`, `backdrop_path`, `first_air_date`, `last_air_date`, `number_of_seasons`, `number_of_episodes`, `vote_average`, `vote_count`, `status`, `updated_at` | TMDB ID (`text`) |
| `tv_series_localizations` | `series_id`, `locale`, `name`, `overview`, `tagline`, `genres`, gerekirse `created_by`/`cast` | `(series_id, locale)` |
| `tv_seasons` | `series_id`, `season_number`, `name`, `overview`, `poster_path`, `air_date`, `episode_count`, `updated_at` | `(series_id, season_number)` |
| `tv_episodes` | `series_id`, `season_number`, `episode_number`, `tmdb_episode_id`, `name`, `overview`, `air_date`, `runtime`, `still_path`, `vote_average`, `updated_at` | `(series_id, season_number, episode_number)`; TMDB episode ID ayrıca unique olabilir |

Tür bazlı katalog tablosu, film ve dizi TMDB ID'leri çakışsa bile çakışmayı önler. Bölüm anahtarında sezon/bölüm numarası kullanılır; specials için sezon 0 ve numarası olmayan öğeler TMDB verisinde kontrol edilerek dayanıklı bir kimlik stratejisi belirlenir.

### Kullanıcı durumu tabloları

| Tablo | Ana alanlar | Amaç |
|---|---|---|
| `user_tv_series` | `user_id`, `series_id`, `status`, `added_at`, `started_at`, `completed_at`, `updated_at`, isteğe bağlı `rating`, `review` | Kullanıcının dizi genel durumu; PK `(user_id, series_id)` |
| `user_tv_episodes` | `user_id`, `series_id`, `season_number`, `episode_number`, `watched_at`, `updated_at` | Kullanıcı bazlı bölüm işaretleri; PK `(user_id, series_id, season_number, episode_number)`; dizi üyeliğine ve bölüm kataloğuna FK |
| `list_items` | `user_id`, `list_id`, `item_type` (`movie`/`tv`), `item_id`, `title`, `poster_path`, `added_at` | Yeni karışık özel liste öğeleri; PK `(user_id, list_id, item_type, item_id)` |

Wishlist ayrı bir tablo veya `user_tv_series.status = 'watchlist'` olarak kanonikleştirilebilir. Öneri: wishlist ve izleniyor/tamamlandı durumunu aynı `user_tv_series` satırında tut; böylece dizi wishlist'ten izleniyor durumuna geçince kimlik ve liste bağlantısı korunur. Mevcut film wishlist/watch log davranışına dokunma. Kullanıcı dizi durum enum değerleri uygulama validasyonunda ve gerekirse DB check constraint'inde sınırlandırılmalı.

### Liste uyumluluğu

- Var olan `list_movies` tablosu ve eski belge yolu film listeleri için kalır; mevcut veri ve public listeler etkilenmez.
- Tüm yeni özel listeler `list_items` üzerinden film veya dizi kabul eder. Okuma katmanı eski film satırlarıyla yeni `movie` öğelerini tekilleştirir; aynı üyeliği iki kaynaktan göstermemek için yeni film eklemeleri için tek yazım yolu belirlenir.
- Güvenli geçiş seçeneği: `list_movies` film kayıtları kaynağı olarak kalır, `list_items` yalnızca TV kayıtlarını tutar; API normalleştirilmiş `items` döndürür. Uzun vadede film kayıtlarını `list_items`'a taşıma ayrı migration olabilir.
- Varsayılan wishlist/watched listelerinin mevcut `list_movies` üyelikleri bugünkü davranışta bağımsız kullanıcı durumlarıyla tutarsızlık yaratabilir. Dizi için default list metadata'sı yeniden kullanılabilir fakat bölüm ilerlemesi ve dizi durumu `user_tv_series` kaynağında kalır.

## API ve veri erişim katmanı

### Katalog Route Handler'ları

- `GET /api/tv/search?q=...&language=...` — doğrulanmış kullanıcının TMDB aramasını sunucu üzerinden yapar.
- `GET /api/tv/{id}?language=...` — cache'li dizi detayı ve sezon özetleri.
- `GET /api/tv/{id}/seasons/{seasonNumber}?language=...` — ilgili sezon/bölüm detayları.
- Kullanıcıya ait okuma/yazmalar mevcut `/api/data` belge uyarlama sözleşmesine eklenebilir; yeni ayrı REST uçları gerekiyorsa aynı kimlik doğrulama ve sahiplik kontrolü korunur.

Route Handler'lar `app` altında Web Request/Response API'sini kullanır. TMDB token'ı sunucuda kalır. TMDB isteklerinde language değeri allowlist edilir; ID/sezon/bölüm değerleri doğrulanır; hata kodları upstream hata metnini sızdırmaz.

### Kullanıcı veri belge yolları

API adapter için açık, tek anlamlı yollar önerisi:

```text
users/{uid}/tvSeries/{seriesId}                            # takip/durum belgesi
users/{uid}/tvSeries/{seriesId}/episodes/{season-episode}   # izlenmiş bölüm
users/{uid}/lists/{listId}/items/{itemType}_{itemId}        # mixed-list öğesi
tvSeries/{seriesId}                                        # katalog belgesi
tvSeries/{seriesId}/localizations/{locale}
tvSeries/{seriesId}/seasons/{seasonNumber}
tvSeries/{seriesId}/seasons/{seasonNumber}/episodes/{episodeNumber}
```

Bugünkü data adapter nested path'leri sınırlı sayıda route'a map ediyor; yeni yolları şema/CRUD/read/query/ownership mantığının tümüne ekle. İstek gövdesindeki `uid` değerine güvenme: yazma/okuma oturum kullanıcısına göre yetkilendirilmeli ve kullanıcılar arası erişim mevcut public profil kurallarını takip etmeli.

### Bölüm işaretleme semantiği

- `PATCH`/belge set işlemi aynı bölüm için idempotent olmalı.
- Bir bölümü izlenmiş yapınca `watched_at` atanır; geri alınca ilgili satır silinir.
- İlerleme sayısı işaretli bölüm sayısıdır; yalnızca yayınlanmış bölümler yüzdesi gösterilir. Henüz yayınlanmayan/özel bölümler paydaya katılmaz.
- `nextEpisode` (izlenmemiş yayınlanmış ilk bölüm), `lastWatchedEpisode` ve progress istemcide/okuma modelinde hesaplanır; cache'lenmiş TMDB kataloğuna kullanıcı verisi yazılmaz.
- Sezonu toplu işaretleme çoklu insert/delete işlemi olarak transaction içinde yapılır.
- Dizi `completed` durumuna otomatik geçiş yalnızca bütün yayınlanmış bölümler izlendiyse düşünülebilir; daha güvenli ilk sürümde kullanıcı `Tamamlandı` seçer, bölüm işaretleri bağımsız kalır.

## Ekranlar ve kullanıcı akışları

### Navigasyon ve dizi kütüphanesi

- Global navigasyona **Diziler** eklenir. Mobil alt navigasyon kapasitesi nedeniyle mevcut ikon/yerleşim tekrar değerlendirilir; sık kullanılan bölümler görünür kalmalı.
- `/tv` (veya `/series`) sayfası: İzleme Durumum, Wishlist, İzlenen/Tamamlanan filtreleri; arama ve boş durum.
- Dizi kartında poster, başlık, TMDB puanı, genel durum rozeti, `X / Y bölüm` ve sonraki bölüm özeti bulunur.
- Ana film kütüphanesi aynı kalır. Dizi kütüphanesinde film kartları görünmez.

### Arama ve detay

- `/search` içinde Film/Dizi arama filtresi veya dizi sayfasında yerel arama deneyimi sunulur. Tek arama kutusu sonuç tipini açık biçimde ayırır.
- `/tv/{id}` detay sayfasında özet, görsel, TMDB puanı, yayın durumu, sezon listesi, toplam bölüm ve kullanıcı durumu bulunur.
- `/tv/{id}/season/{seasonNumber}` ayrı route olabilir veya detay içinde açılır sezon bölümü olabilir. İlk sürümde detay içinde sezon akordeonu ve lazy-load bölüm çağrısı daha düşük kapsamlıdır.
- Her bölüm satırı numara, başlık, yayın tarihi, özet (varsa), süre ve izlendi kontrolü sunar. Bir sonraki bölüm kolayca fark edilir.
- TMDB'deki sezon 0 specials ayrı başlıkla gösterilir; bölüm sıralaması numara ve yayın durumuna göre sabitlenir.

### Wishlist, izlenen arşivi, profil

- `/` film koleksiyonu film odaklı kalır; diziler için ayrı giriş/özet kartı eklenebilir ama ana grid karışmaz.
- `/profile` arşivinde Filmler / Diziler görünüm seçicisi olur. Profil sayaçları tür bazında ayrılır; dizi sayacı dizi sayısını, ilerleme toplamı bölüm sayısını ifade eder.
- Public profil ve public listelerde dizi görünürlüğü kullanıcı ve liste gizlilik kurallarıyla aynı şekilde korunur.
- Dizi rating/review MVP'de hariç tutulabilir; kullanıcı özellikle dizi puanı isterse aynı bağımsız genel dizi durumuna alan eklenir. Film ve dizi puanları birbirine karıştırılmaz.

### Karışık özel listeler

- Yeni özel liste oluşturma ekranı değişmez; film/dizi detayından “Listeye ekle” açılır.
- Liste grid'i tür rozetini ve türe göre doğru detay linkini kullanır.
- Liste sıralama, sayım, silme ve public paylaşım sorguları öğe türünü taşır.
- Var olan `moviesCount` gibi alanlar uyum için korunabilir, yanıltıcı olmaması için API/UI'da `itemsCount` kullanılır.

## Dosya/katman bazlı olası değişiklik alanları

- `src/lib/db/schema.ts` — katalog, takip, episode marks ve mixed list item tabloları.
- `drizzle/` — additive migration; FK/index/unique constraint'ler.
- `src/lib/tmdb.ts` veya yeni `src/lib/tmdb-tv.ts` — TMDB TV normalize/cache katmanı.
- `src/app/api/tv/**/route.ts` — arama ve katalog Route Handler'ları.
- `src/app/api/data/route.ts` — TV belge yolu ve list item CRUD/read mapping; auth/sahiplik kontrolleri.
- `src/types/index.ts` — `TVSeries`, `TVSeason`, `TVEpisode`, takip ve liste öğesi union tipleri.
- `src/context/AppDataContext.tsx` veya ayrı `TVDataContext.tsx` — kullanıcı dizi takibi ve dinleyici yaşam döngüsü. Film context'i gereksiz yeniden render almamalı.
- `src/components/BottomNav.tsx`, `MobileBottomBar.tsx` — dizi navigasyonu.
- Yeni `src/app/tv/page.tsx`, `src/app/tv/[id]/page.tsx` ve ortak TV kartı/sezon/bölüm bileşenleri.
- `src/app/lists/[id]/page.tsx`, liste oluşturma/özet komponentleri — türlenmiş liste öğeleri.
- `src/app/profile/page.tsx` ve profil bileşenleri — dizi arşivi ve sayaçları.
- `src/lib/i18n.ts` — Türkçe/İngilizce dizi ve bölüm etiketleri, durumlar, boş/hata/yüklenme metinleri.
- `.env.example`, README — gizli sunucu TMDB kimlik bilgisi, atıf ve yerel kurulum.

## Sıralı uygulama aşamaları

### Aşama 0 — Davranışı ve sözleşmeleri sabitle

1. Film wishlist, watch log, default list ve custom list API çağrılarını haritala.
2. Dizi durum değerleri, bölüm işaretinin geri alınması ve liste karma davranışını tip/sözleşme düzeyinde kesinleştir.
3. Auth/API adapter'ın kullanıcı sahipliği ve public profil yetkisini kontrol et.

**Çıkış ölçütü:** Her dizi state'i için tek bir kanonik tablo ve belge yolu; listeler için film eski yolunun yeni yol ile çakışmaması.

### Aşama 1 — Şema ve cache

1. TV katalog/localization/season/episode tablolarını ekle.
2. Kullanıcı dizi durumu ve episode mark tablolarını ekle.
3. `list_items` mixed-list tablosunu ekle ve FK davranışını netleştir.
4. Index'leri kullanıcı+dizi, durum, liste ve sezon bölüm sorgularına göre ekle.
5. Drizzle migration üret ve boş/var olan DB upgrade senaryosunu gözden geçir.

**Çıkış ölçütü:** Mevcut film tablosu ve kayıtları değişmeden migration uygulanabilir; migration rollback/backup stratejisi belgeli.

### Aşama 2 — TMDB sunucu entegrasyonu

1. TV arama/detay/sezon endpoint normalizer'larını yaz.
2. Katalog cache hit/miss ve localization davranışını ekle.
3. Bölüm listesini sezon açıldığında getir; upstream hata ve rate-limit senaryolarını ele al.
4. TMDB key'i private server env'e taşıma gereksinimini mevcut deploy ile uyumlu çöz.
5. TMDB atfını uygun ekran/footer/about alanında göster.

**Çıkış ölçütü:** Arama/detay/sezon verisi dil ayarıyla doğru döner, özel key browser bundle veya response'a sızmaz.

### Aşama 3 — API adapter ve kullanıcı state'i

1. Dizi catalog read/write mapping'ini ekle.
2. Kullanıcı dizi takip kaydı için create/update/delete/query ekle.
3. Episode mark idempotent set/delete ve toplu sezon işaretleme ekle.
4. Mixed list item CRUD ekle; owner, member, public/private kontrollerini uygula.
5. Kullanıcı verisi sorgularını oturum UID'siyle sınırla; denormalize title/poster yalnızca liste performansı için kullanılsın.

**Çıkış ölçütü:** Bir kullanıcının yazma isteği başka UID adına state değiştiremez; tekrar eden bölüm işaretleme duplicate üretmez.

### Aşama 4 — Dizi gezinme ve bölüm UX'i

1. Dizi nav linki ve `/tv` kütüphanesini ekle.
2. Arama sonucu kartı ve ekleme durum aksiyonlarını ekle.
3. Dizi detayında özet, sezonlar ve progress header oluştur.
4. Bölüm satırı işaretleme, undo ve sezon toplu işlemini ekle.
5. Loading skeleton, boş state, API/cache hata ve mobil erişilebilir focus/label davranışlarını tamamla.

**Çıkış ölçütü:** Kullanıcı diziyi bulur, takibe ekler, kaldığı bölümü görür ve bölüm işaretini geri alabilir.

### Aşama 5 — Wishlist, arşiv, profil ve listeler

1. Dizi kütüphanesinde durum filtreleri ve ayrı wishlist/tamamlanan görünümleri.
2. Profilde Film/Dizi sekmeleri ve tür bazlı sayılar.
3. Özel listelerde film/dizi karışık üyelik, tür rozeti ve doğru detay linki.
4. Public list/profile görünümünde yalnızca paylaşılabilir içerik.
5. Eski liste sayımı ve API response uyumluluğunu gözden geçir.

**Çıkış ölçütü:** Varsayılan film wishlist/watched görünümü değişmeden kalır; özel listeler iki türü birlikte gösterebilir.

### Aşama 6 — Geçiş, operasyon ve yayın hazırlığı

1. Gerekliyse eski liste film kayıtlarından `list_items`'a kopyalama için tekrar çalıştırılabilir migration hazırla; aksi halde kademeli dual-read stratejisini belgeleyip uygula.
2. Eski client sürümü veya cache durumunda yeni API alanlarının kırılmadığını doğrula.
3. TMDB attribution, API key, rate-limit, deploy env ve DB migration sırasını README/release notlarına ekle.
4. Ürün analitiği kararı varsa arama, ekleme ve episode mark olaylarını kişisel içerik sızdırmadan tanımla.

**Çıkış ölçütü:** Deploy sırası, geri dönüş yolu ve görünür TMDB atfı hazır.

## Doğrulama matrisi

Uygulama aşamasında aşağıdaki kontrolleri çalıştır:

- DB migration yeni kurulumda ve mevcut film verili DB'de başarılı; film satırları değişmez.
- TMDB arama, cache hit/miss, Türkçe/İngilizce dizi ve sezon/bölüm verisi.
- Dizi durumları arasında geçiş; izleniyor → beklemede → izleniyor.
- Bölüm işaretleme idempotent; undo, son izlenen ve sonraki bölüm yeniden hesaplanır.
- Sezon toplu mark/unmark ve specials/sezon 0 davranışı.
- Wishlist ile dizi takibi, ilerleme ve tamamlandı durumunun bağımsız/doğru görünmesi.
- Mixed custom list ekleme/çıkarma, sayaç, refresh ve public/private erişim.
- İki kullanıcı arasında dizi state ve private liste sızıntısı olmaması.
- Mobil navigasyon, uzun başlıklar, eksik poster/özet, yayınlanmamış bölüm ve sıfır bölüm edge case'leri.
- Türkçe/İngilizce kopya, klavye erişimi, loading/empty/error durumları.

## Kapsam dışı bırakılabilecek ilk sürüm öğeleri

- Otomatik yayın takvimi bildirimi ve push notification.
- Arkadaş aktivite akışı ve ortak izleme.
- Dizi/bölüm yorumları veya arkadaşlara bölüm önerme.
- Episode bazında tarihli rewatch geçmişi; ilk sürümde her bölüm için güncel izlendi durumu yeterli.
- Birden fazla watch-through/rewatch progress profili.
- TMDB dışı ikinci katalog sağlayıcısı.

Bu öğeler ana bölüm takibi, durumlar ve karışık özel listeler sorunsuz çalıştıktan sonra ele alınmalı.
