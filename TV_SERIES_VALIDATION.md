# Dizi deneyimi ve doğrulama

Dizi kütüphanesi ve detay ekranı ortak kart, görsel başlık, ilerleme ve sezon bileşenleriyle yenilendi. Film ekranındaki oyuncular ve yayın sağlayıcıları bileşenleri yeniden kullanılır. Türkçe/İngilizce metinler desteklenir.

- Sezon bölümleri kullanıcı sezonu açınca yüklenir; kapanan/eski istekler iptal edilir.
- İlerleme özeti sunucuda, saatlik TMDB sezon cache'i üzerinden hesaplanır. Soğuk cache'te kesin toplam ve sıradaki bölüm için normal sezonlar en fazla dört eşzamanlı istekle okunur; bu sırada detay ekranı kullanılabilir. Özel bölümler toplamın dışında kalır.
- İzlendi yazımları sunucuda gerçek katalog ve yayın tarihiyle doğrulanır. Geri alma eski işaretleri de temizleyebilir.
- Aynı bölümü tekrar işaretlemek kayıt çoğaltmaz. Sezon işlemleri transaction içinde yapılır.
- Film/dizi liste kartları, sayaçlar ve boş durumlar birlikte değerlendirilir. Profildeki dizi arşivi bağlantıları tür seçimini URL'de taşır.
- Geliştirmede service worker shell cache'i kapatılır; üretim cache sürümü v3'e yükseltildi.

## Tekrar çalıştırılabilir testler

- `npm run test:tv`: yayın tarihi, specials, sıralama, tekrar işaretleme, geri alma ve boş katalog için dört test.
- `npm run test:tv:api`: çalışan yerel uygulama ve `.env` veritabanıyla takip, bölüm, toplu sezon, ilerleme ve iki kullanıcı arasında liste erişimi için entegrasyon kontrolleri. Geçici kullanıcılar oluşturur ve `finally` içinde temizler; kullanılan katalog kaydını eski haline döndürür. Gerçek kullanıcı oturumlarını kullanmaz.
- `npx tsc --noEmit`
- `npm run build`

Entegrasyon testleri gerçek TMDB erişimi ve uygulanmış dizi migration'ını gerektirir. Bu değişiklik ek migration gerektirmez; branch'teki `0004_watery_mockingbird.sql` yeni kurulum/yayın sırasında uygulanmış olmalıdır.
