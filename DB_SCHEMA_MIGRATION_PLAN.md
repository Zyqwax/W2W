# W2W ilişkisel veritabanı şeması ve geçiş planı

## Neden kayıtlar `app_document` altında görünüyor?

Mevcut PostgreSQL şeması Better Auth için `user`, `session`, `account` ve `verification` tablolarını kullanıyor. Uygulama verileri ise Firestore belge yollarını PostgreSQL'e uyarlayan tek `app_document` tablosunda saklanıyor. `path`, `collection_path`, `document_id` ve `data jsonb` alanları sayesinde `movies/101`, `users/{id}/lists/...` gibi farklı belge türleri aynı tabloda tutuluyor. Bu, ilk geçişte eski belge API'siyle uyumluluğu hızlandırdı; ancak ilişkiler veritabanı tarafından doğrulanamıyor ve kayıtlar türe göre ayrı tablolar halinde görünmüyor.

## Yeni şema

`src/lib/db/schema.ts` artık yeni ilişkisel tabloları da tanımlar. Better Auth tabloları mevcut halleriyle korunur. `user` profiline dil, bölge ve son görülme alanları eklendi.

| Tablo | İçerik | Ana ilişki |
|---|---|---|
| `user` | Hesap ve profil alanları | Better Auth kullanıcı kimliği |
| `movies` | TMDB film kataloğu | TMDB film ID'si |
| `movie_localizations` | Dil başına başlık, açıklama, türler ve oyuncular | `(movie_id, locale)` |
| `movie_providers` | Bölge başına izleme sağlayıcıları | `(movie_id, region)` |
| `lists` | Kullanıcı listelerinin adı ve görünürlüğü | `user_id → user.id` |
| `list_movies` | Özel/genel listelerdeki filmler | `(list_id, movie_id)` |
| `wishlist` | Kullanıcı izleme listesi | `(user_id, movie_id)` |
| `watch_logs` | İzleme durumu, geçmişi, puan ve yorum | `(user_id, movie_id)` |
| `friends` | Kullanıcılar arası arkadaş bağlantıları | `(user_id, friend_user_id)` |
| `chats` | Sohbet özeti ve katılımcılar | Sohbet ID'si |
| `messages` | Sohbet mesajları ve film önerileri | `chat_id → chats.id` |

Film ID'leri TMDB ile mevcut URL ve belge yolları uyumlu kalsın diye `text` tutulur. Film temel bilgileri tek `movies` satırında; dile ve bölgeye göre değişen bilgiler ayrı tablolardadır. Dış servisten gelen değişken sağlayıcı/oyuncu listeleri JSONB kalır; uygulamanın ana varlık ve ilişki kayıtları artık JSONB belge tablosunda tutulmak zorunda değildir.

## Geçiş planı

`scripts/convert-app-documents.mjs` eski kayıtları yeni tablolara tek seferde taşır. Fallback okuma veya çift yazma eklemez. Başarılı `--apply` sonunda kaynak `app_document` tablosunu kaldırır.

1. `pnpm db:migrate` ile hedef tabloları oluştur.
2. `pnpm db:convert-documents` ile dönüşümü dry-run yap; script değişiklikleri rollback eder ve hedef tablo sayılarını raporlar.
3. Yedeği aldıktan sonra `pnpm db:convert-documents -- --apply` ile dönüştür. Script kullanıcı eşleşmelerini denetler, tek transaction içinde verileri taşır ve sonunda `app_document` tablosunu kaldırır. Herhangi bir hata tüm işlemi rollback eder.
4. `src/app/api/data/route.ts` artık `app_document` kullanmıyor; aynı istemci veri çağrılarını `movies`, `lists`, `wishlist`, `watch_logs`, `friends`, `chats` ve ilişkili tablolara yönlendiriyor. Bu nedenle dönüşümden sonra istemci verileri yeni şemadan okumaya/yazmaya devam eder.

## Önemli dönüşüm kuralları

- `users/{uid}/lists/wishlist/movies/{movieId}` kayıtları `wishlist` satırlarına gider. Genel `lists`/`list_movies` tablosuna da kopyalanıp kopyalanmayacağı adapter tasarımında tek bir kanonik davranış olarak kararlaştırılmalı; aynı üyeliği iki farklı kaynaktan okumayın.
- `lists` içindeki `wishlist` ve `watched` varsayılan listeleri `type = 'default'` ile kalır. Eski sistemde watched list üyeliği ile `watchLog` ayrı tutulduğu için bu iki kaynağı birleştirmeyin.
- `friends` mevcut kullanıcı bazlı yönlü kayıtları temsil eder. İlişki uygulamada karşılıklıysa iki yönlü satırı da backfill edin; değilse bu tablo ilişki isteği durumuyla genişletilmeli.
- `chats.participants` ve `unread_by` başlangıçta JSONB dizisi olarak kalır. Üye bazlı arama/izin sorguları yoğunlaşırsa sonradan `chat_participants` ilişkisel tablosuna ayrılabilir.
- Auth `user` satırı uygulama profilinin kimlik kaynağıdır; migration yeni kullanıcı yaratmamalı ve Better Auth kayıtlarını değiştirmemelidir.

## Geri dönüş

Dry-run kalıcı değişiklik yapmaz. `--apply` başarısız olursa kopyalama ve tablo silme birlikte rollback olur. Apply başarılı olduktan sonra geri dönüş için dönüşüm öncesi yedeği geri yüklemek gerekir.
